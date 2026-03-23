-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================
create type user_role as enum ('admin', 'client', 'editor');
create type site_status as enum ('active', 'building', 'error', 'paused');
create type deploy_status as enum ('success', 'building', 'failed', 'cancelled');
create type contract_status as enum ('active', 'pending', 'expired', 'cancelled');
create type payment_status as enum ('paid', 'pending', 'overdue', 'cancelled');
create type client_status as enum ('active', 'inactive', 'lead');

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'client',
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'client'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- =============================================
-- CLIENTS (CRM)
-- =============================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  company_name text,
  contact_name text not null,
  email text not null,
  phone text,
  address text,
  notes text,
  status client_status not null default 'lead',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- =============================================
-- SITES
-- =============================================
create table sites (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text,
  github_repo text,
  netlify_site_id text,
  netlify_url text,
  status site_status not null default 'paused',
  owner_id uuid not null references profiles(id) on delete cascade,
  template text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sites_updated_at
  before update on sites
  for each row execute function update_updated_at();

create index sites_owner_idx on sites(owner_id);
create index sites_netlify_idx on sites(netlify_site_id);

-- =============================================
-- DEPLOYMENTS
-- =============================================
create table deployments (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  deploy_id text not null,
  status deploy_status not null default 'building',
  commit_message text,
  commit_hash text,
  branch text,
  deploy_url text,
  error_message text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index deployments_site_idx on deployments(site_id);
create index deployments_status_idx on deployments(status);

-- =============================================
-- CONTRACTS
-- =============================================
create table contracts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  amount numeric(10,2) not null,
  currency text not null default 'ILS',
  status contract_status not null default 'pending',
  start_date date not null,
  end_date date,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contracts_updated_at
  before update on contracts
  for each row execute function update_updated_at();

-- =============================================
-- PAYMENTS
-- =============================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'ILS',
  status payment_status not null default 'pending',
  due_date date not null,
  paid_date date,
  description text,
  invoice_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payments_updated_at
  before update on payments
  for each row execute function update_updated_at();

create index payments_client_idx on payments(client_id);
create index payments_status_idx on payments(status);

-- =============================================
-- MEDIA
-- =============================================
create table media (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  filename text not null,
  original_name text not null,
  mime_type text not null,
  size integer not null,
  url text not null,
  storage_path text not null,
  alt_text text,
  folder text,
  created_at timestamptz not null default now()
);

create index media_owner_idx on media(owner_id);

-- =============================================
-- AUTOMATIONS
-- =============================================
create table automations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  n8n_workflow_id text,
  trigger_type text not null default 'manual',
  is_active boolean not null default false,
  last_run_at timestamptz,
  run_count integer not null default 0,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger automations_updated_at
  before update on automations
  for each row execute function update_updated_at();

-- =============================================
-- CHATBOTS
-- =============================================
create table chatbots (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  site_id uuid references sites(id) on delete set null,
  config jsonb not null default '{}',
  is_active boolean not null default false,
  ai_provider text not null default 'claude' check (ai_provider in ('claude', 'openai')),
  model text not null default 'claude-opus-4-6',
  system_prompt text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger chatbots_updated_at
  before update on chatbots
  for each row execute function update_updated_at();

-- =============================================
-- SOCIAL POSTS
-- =============================================
create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  platforms text[] not null default '{}',
  media_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger social_posts_updated_at
  before update on social_posts
  for each row execute function update_updated_at();

-- =============================================
-- AUDIT LOGS
-- =============================================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_user_idx on audit_logs(user_id);
create index audit_logs_action_idx on audit_logs(action);
create index audit_logs_created_idx on audit_logs(created_at desc);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table sites enable row level security;
alter table deployments enable row level security;
alter table contracts enable row level security;
alter table payments enable row level security;
alter table media enable row level security;
alter table automations enable row level security;
alter table chatbots enable row level security;
alter table social_posts enable row level security;
alter table audit_logs enable row level security;

-- Helper function: get current user role
create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- PROFILES policies
create policy "Users can view own profile"
  on profiles for select using (id = auth.uid());

create policy "Admin can view all profiles"
  on profiles for select using (get_user_role() = 'admin');

create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());

-- SITES policies
create policy "Clients see own sites"
  on sites for select using (
    owner_id = auth.uid() or get_user_role() = 'admin'
  );

create policy "Admin full access to sites"
  on sites for all using (get_user_role() = 'admin');

-- DEPLOYMENTS policies
create policy "View deployments for own sites"
  on deployments for select using (
    get_user_role() = 'admin' or
    exists (
      select 1 from sites where sites.id = deployments.site_id
        and sites.owner_id = auth.uid()
    )
  );

create policy "Admin manage deployments"
  on deployments for all using (get_user_role() = 'admin');

-- CLIENTS policies
create policy "Admin full access to clients"
  on clients for all using (get_user_role() = 'admin');

create policy "Client see own record"
  on clients for select using (profile_id = auth.uid());

-- CONTRACTS policies
create policy "Admin full access to contracts"
  on contracts for all using (get_user_role() = 'admin');

create policy "Client see own contracts"
  on contracts for select using (
    exists (
      select 1 from clients where clients.id = contracts.client_id
        and clients.profile_id = auth.uid()
    )
  );

-- PAYMENTS policies
create policy "Admin full access to payments"
  on payments for all using (get_user_role() = 'admin');

create policy "Client see own payments"
  on payments for select using (
    exists (
      select 1 from clients where clients.id = payments.client_id
        and clients.profile_id = auth.uid()
    )
  );

-- MEDIA policies
create policy "Users see own media"
  on media for select using (owner_id = auth.uid() or get_user_role() = 'admin');

create policy "Users manage own media"
  on media for all using (owner_id = auth.uid() or get_user_role() = 'admin');

-- AUTOMATIONS - admin only
create policy "Admin manage automations"
  on automations for all using (get_user_role() = 'admin');

-- CHATBOTS - admin only
create policy "Admin manage chatbots"
  on chatbots for all using (get_user_role() = 'admin');

-- SOCIAL POSTS - admin only
create policy "Admin manage social posts"
  on social_posts for all using (get_user_role() = 'admin');

-- AUDIT LOGS
create policy "Admin view audit logs"
  on audit_logs for select using (get_user_role() = 'admin');

create policy "Service can insert audit logs"
  on audit_logs for insert with check (true);
