-- PayMe payment settings
insert into agency_settings (key, value) values
  ('payme_seller_id', null),
  ('payme_api_key',   null)
on conflict (key) do nothing;
