-- Chat sessions per site visitor
create table if not exists chat_sessions (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid references sites(id) on delete cascade,
  visitor_id   text not null,
  lead_id      uuid references leads(id) on delete set null,
  started_at   timestamptz not null default now(),
  last_msg_at  timestamptz not null default now()
);

-- Chat messages
create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_idx on chat_messages(session_id);
create index if not exists chat_sessions_site_idx   on chat_sessions(site_id);

-- Chatbot config stored in site_settings:
--   key = 'chatbot_enabled'   value = true / false
--   key = 'chatbot_greeting'  value = "שלום! במה אוכל לעזור?"
--   key = 'chatbot_context'   value = { businessName, services, hours, prices, faq, tone, phone, whatsapp }
--   key = 'whatsapp_number'   value = "972501234567"

-- RLS: read-only for anon (chat api uses service role), full for admin
alter table chat_sessions enable row level security;
alter table chat_messages  enable row level security;

create policy "service_role_all_sessions" on chat_sessions for all using (true);
create policy "service_role_all_messages" on chat_messages for all using (true);
