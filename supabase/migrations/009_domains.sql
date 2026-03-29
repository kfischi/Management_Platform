-- Domains management table
create table domains (
  id          uuid primary key default gen_random_uuid(),
  domain      text not null unique,
  site_id     uuid references sites(id) on delete set null,
  registrar   text,
  expires_at  date,
  auto_renew  boolean not null default true,
  ssl_enabled boolean not null default true,
  ssl_expires_at date,
  status      text not null default 'active'
    check (status in ('active', 'expiring', 'expired', 'error')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger domains_updated_at
  before update on domains
  for each row execute function handle_updated_at();

create index domains_site_id_idx on domains(site_id);
create index domains_status_idx  on domains(status);

alter table domains enable row level security;

create policy "Admin full access to domains"
  on domains for all using (get_user_role() = 'admin');
