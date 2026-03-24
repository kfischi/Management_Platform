-- Leads pipeline table
create table leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text not null,
  phone       text,
  source      text not null default 'manual',
  status      text not null default 'new'
    check (status in ('new','contacted','qualified','proposal','won','lost')),
  score       integer not null default 50 check (score between 0 and 100),
  value       numeric(12,2) not null default 0,
  notes       text,
  tags        text[] not null default '{}',
  ai_insight  text,
  assigned_to uuid references profiles(id) on delete set null,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger leads_updated_at
  before update on leads
  for each row execute function handle_updated_at();

create index leads_status_idx on leads(status);
create index leads_email_idx  on leads(email);

alter table leads enable row level security;

create policy "Admin full access to leads"
  on leads for all using (get_user_role() = 'admin');
