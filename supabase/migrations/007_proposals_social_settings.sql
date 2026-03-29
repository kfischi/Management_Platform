-- Proposals table
create table proposals (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  client_company text,
  client_email  text not null,
  project_name  text not null,
  project_type  text not null,
  services      jsonb not null default '[]',
  valid_days    integer not null default 30,
  notes         text,
  status        text not null default 'draft'
    check (status in ('draft','sent','viewed','accepted','declined')),
  total_amount  numeric(12,2) not null default 0,
  sent_at       timestamptz,
  viewed_at     timestamptz,
  accepted_at   timestamptz,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger proposals_updated_at
  before update on proposals
  for each row execute function handle_updated_at();

alter table proposals enable row level security;

create policy "Admin full access to proposals"
  on proposals for all using (get_user_role() = 'admin');

-- Social posts / calendar table
create table social_posts (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  platforms   text[] not null default '{}',
  post_type   text not null default 'text'
    check (post_type in ('text','image','video','reel')),
  status      text not null default 'draft'
    check (status in ('draft','scheduled','published','failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  image_url   text,
  tags        text[] not null default '{}',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger social_posts_updated_at
  before update on social_posts
  for each row execute function handle_updated_at();

create index social_posts_status_idx on social_posts(status);
create index social_posts_scheduled_idx on social_posts(scheduled_at);

alter table social_posts enable row level security;

create policy "Admin full access to social_posts"
  on social_posts for all using (get_user_role() = 'admin');

-- Agency settings (key-value store)
create table agency_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

alter table agency_settings enable row level security;

create policy "Admin full access to agency_settings"
  on agency_settings for all using (get_user_role() = 'admin');

-- Seed default keys
insert into agency_settings (key, value) values
  ('agency_name',    null),
  ('agency_email',   null),
  ('agency_phone',   null),
  ('agency_logo',    null),
  ('brand_color',    '#6366f1'),
  ('n8n_url',        null),
  ('n8n_api_key',    null),
  ('netlify_token',  null),
  ('github_token',   null),
  ('resend_api_key', null),
  ('whatsapp_token', null),
  ('whatsapp_phone', null),
  ('ai_provider',    'claude'),
  ('claude_api_key', null),
  ('openai_api_key', null)
on conflict (key) do nothing;
