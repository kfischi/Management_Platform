-- Email Sequences (drip campaigns)
-- Triggered on: new lead, manual enroll, tag added, form submission

create table email_sequences (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  trigger     text not null default 'manual',
  -- trigger values: 'manual' | 'new_lead' | 'tag_added' | 'form_submit' | 'site_visit'
  trigger_config jsonb default '{}',
  -- e.g. { "tag": "hot", "site_id": "...", "form_id": "..." }
  is_active   boolean default true,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Steps within a sequence
create table email_sequence_steps (
  id          uuid default gen_random_uuid() primary key,
  sequence_id uuid references email_sequences(id) on delete cascade,
  step_number int not null,               -- 1, 2, 3 ...
  delay_days  int not null default 0,     -- days after previous step (0 = same day)
  subject     text not null,
  body_html   text not null,
  from_name   text,
  from_email  text,
  created_at  timestamptz default now(),
  unique(sequence_id, step_number)
);

-- Who is enrolled in which sequence
create table email_sequence_enrollments (
  id           uuid default gen_random_uuid() primary key,
  sequence_id  uuid references email_sequences(id) on delete cascade,
  lead_id      uuid references leads(id) on delete cascade,
  current_step int default 0,             -- last completed step number
  next_send_at timestamptz,               -- when to send next step
  status       text not null default 'active',
  -- status values: 'active' | 'paused' | 'completed' | 'unsubscribed'
  enrolled_at  timestamptz default now(),
  completed_at timestamptz,
  unique(sequence_id, lead_id)
);

-- Log every email sent
create table email_logs (
  id            uuid default gen_random_uuid() primary key,
  enrollment_id uuid references email_sequence_enrollments(id) on delete set null,
  step_id       uuid references email_sequence_steps(id) on delete set null,
  lead_id       uuid references leads(id) on delete set null,
  to_email      text not null,
  subject       text not null,
  resend_id     text,
  status        text not null default 'sent',
  -- status: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed'
  sent_at       timestamptz default now()
);

-- Site analytics: page views
create table site_analytics (
  id         uuid default gen_random_uuid() primary key,
  site_id    uuid references sites(id) on delete cascade,
  page_slug  text not null default 'home',
  visitor_id text,                        -- anonymous, from localStorage
  referrer   text,
  user_agent text,
  country    text,
  created_at timestamptz default now()
);

-- Index for fast queries
create index on email_sequence_enrollments (next_send_at) where status = 'active';
create index on email_sequence_enrollments (sequence_id, lead_id);
create index on email_logs (lead_id, sent_at desc);
create index on site_analytics (site_id, created_at desc);
create index on site_analytics (site_id, page_slug);
