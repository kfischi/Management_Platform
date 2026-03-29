-- Notifications table
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null default 'info'
    check (type in ('success','warning','info','error')),
  title       text not null,
  body        text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, read);

alter table notifications enable row level security;

create policy "Users see own notifications"
  on notifications for select using (user_id = auth.uid());
create policy "Users update own notifications"
  on notifications for update using (user_id = auth.uid());
create policy "Admin full access to notifications"
  on notifications for all using (get_user_role() = 'admin');

-- Support tickets table
create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references profiles(id) on delete set null,
  subject     text not null,
  message     text not null,
  status      text not null default 'open'
    check (status in ('open','in_progress','resolved','closed')),
  priority    text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  reply       text,
  replied_at  timestamptz,
  replied_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger tickets_updated_at
  before update on support_tickets
  for each row execute function handle_updated_at();

create index tickets_client_idx  on support_tickets(client_id);
create index tickets_status_idx  on support_tickets(status);

alter table support_tickets enable row level security;

create policy "Client sees own tickets"
  on support_tickets for select using (client_id = auth.uid());
create policy "Client inserts own tickets"
  on support_tickets for insert with check (client_id = auth.uid());
create policy "Admin full access to tickets"
  on support_tickets for all using (get_user_role() = 'admin');
