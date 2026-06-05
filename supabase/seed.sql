insert into app_users (id, role, phone, name) values
  ('00000000-0000-0000-0000-000000000001', 'CUSTOMER', '+919000000001', 'Demo Customer'),
  ('00000000-0000-0000-0000-000000000002', 'PARTNER', '+919000000002', 'Ravi Kumar'),
  ('00000000-0000-0000-0000-000000000003', 'ADMIN', '+919000000003', 'Ops Admin')
on conflict do nothing;

insert into customers (id, user_id, company_name, gst_number) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Demo Retail Store', '29ABCDE1234F1Z5')
on conflict do nothing;

insert into partners (id, user_id, status, rating, total_trips, current_lat, current_lng, last_seen_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'ACTIVE', 4.9, 213, 12.9758, 77.6090, now())
on conflict do nothing;

insert into vehicles (partner_id, type, plate_number, capacity_kg) values
  ('20000000-0000-0000-0000-000000000001', 'TATA_ACE', 'KA01AB1234', 750)
on conflict do nothing;
