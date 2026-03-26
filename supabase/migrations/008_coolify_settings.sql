-- Add Coolify integration settings
insert into agency_settings (key, value) values
  ('coolify_url',   null),
  ('coolify_token', null)
on conflict (key) do nothing;
