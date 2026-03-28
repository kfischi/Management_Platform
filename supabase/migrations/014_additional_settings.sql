-- SMS via Twilio
insert into agency_settings (key, value) values
  ('twilio_account_sid',  null),
  ('twilio_auth_token',   null),
  ('twilio_from_number',  null)
on conflict (key) do nothing;

-- Agency branding (for proposals/invoices)
insert into agency_settings (key, value) values
  ('agency_name',    null),
  ('agency_email',   null),
  ('agency_phone',   null),
  ('agency_address', null),
  ('agency_logo',    null)
on conflict (key) do nothing;
