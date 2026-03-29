-- Additional communication provider settings
insert into agency_settings (key, value) values
  ('resend_from_email', null),
  ('evolution_api_key', null),
  ('evolution_api_url', null),
  ('evolution_instance', null),
  ('n8n_whatsapp_webhook', null)
on conflict (key) do nothing;
