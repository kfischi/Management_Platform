-- Full sales pipeline tracking

-- Add pipeline stage to leads
alter table leads
  add column if not exists pipeline_stage text not null default 'lead'
  check (pipeline_stage in ('lead','proposal','approved','building','review','approved_live','live'));

-- Add review token to sites (for client approval portal)
alter table sites
  add column if not exists review_token uuid default gen_random_uuid(),
  add column if not exists review_status text not null default 'pending'
  check (review_status in ('pending','approved','changes_requested')),
  add column if not exists review_comment text;

-- Timeline events log (audit trail for pipeline moves)
create table if not exists pipeline_events (
  id           uuid default gen_random_uuid() primary key,
  lead_id      uuid references leads(id) on delete cascade,
  from_stage   text,
  to_stage     text not null,
  note         text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz default now()
);

create index if not exists pipeline_events_lead_id on pipeline_events(lead_id);

-- Update existing won leads to pipeline stage 'live'
update leads set pipeline_stage = 'live' where status = 'won';
