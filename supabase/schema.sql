create extension if not exists "pgcrypto";

create type user_role as enum ('CUSTOMER', 'PARTNER', 'ADMIN', 'SUPPORT');
create type user_status as enum ('ACTIVE', 'SUSPENDED', 'DELETED');
create type partner_status as enum ('PENDING_KYC', 'ACTIVE', 'OFFLINE', 'SUSPENDED');
create type vehicle_type as enum ('TWO_WHEELER', 'THREE_WHEELER', 'TATA_ACE', 'PICKUP_8FT', 'TATA_407');
create type booking_status as enum ('DRAFT', 'QUOTED', 'SEARCHING_PARTNER', 'PARTNER_ASSIGNED', 'ARRIVING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED');
create type stop_type as enum ('PICKUP', 'DROP', 'WAYPOINT');
create type payment_status as enum ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');
create type payment_method as enum ('CASH', 'UPI', 'CARD', 'WALLET');

create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  role user_role not null,
  status user_status not null default 'ACTIVE',
  phone text unique not null,
  email text unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references app_users(id) on delete cascade,
  company_name text,
  gst_number text,
  wallet_cents integer not null default 0
);

create table partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references app_users(id) on delete cascade,
  status partner_status not null default 'PENDING_KYC',
  kyc_reference text,
  rating numeric(3,2) not null default 5,
  total_trips integer not null default 0,
  current_lat numeric(10,7),
  current_lng numeric(10,7),
  last_seen_at timestamptz
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners(id) on delete cascade,
  type vehicle_type not null,
  plate_number text unique not null,
  capacity_kg integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  customer_id uuid not null references customers(id),
  partner_id uuid references partners(id),
  vehicle_type vehicle_type not null,
  status booking_status not null default 'QUOTED',
  goods_type text not null,
  load_weight_kg integer not null,
  distance_km numeric(8,2) not null,
  scheduled_at timestamptz,
  quoted_fare_cents integer not null,
  final_fare_cents integer,
  cancellation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_stops (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type stop_type not null,
  address text not null,
  lat numeric(10,7),
  lng numeric(10,7),
  sequence integer not null
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references bookings(id) on delete cascade,
  base_fare_cents integer not null,
  distance_cents integer not null,
  handling_cents integer not null,
  tax_cents integer not null,
  total_cents integer not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references bookings(id) on delete cascade,
  status payment_status not null default 'PENDING',
  method payment_method not null,
  amount_cents integer not null,
  provider text not null,
  provider_reference text,
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create table tracking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  partner_id uuid references partners(id),
  status booking_status not null,
  lat numeric(10,7),
  lng numeric(10,7),
  note text,
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;
alter table customers enable row level security;
alter table partners enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table booking_stops enable row level security;
alter table payments enable row level security;
alter table tracking_events enable row level security;

create policy "service role manages app data" on app_users for all using (auth.role() = 'service_role');
create policy "service role manages customers" on customers for all using (auth.role() = 'service_role');
create policy "service role manages partners" on partners for all using (auth.role() = 'service_role');
create policy "service role manages vehicles" on vehicles for all using (auth.role() = 'service_role');
create policy "service role manages bookings" on bookings for all using (auth.role() = 'service_role');
create policy "service role manages stops" on booking_stops for all using (auth.role() = 'service_role');
create policy "service role manages payments" on payments for all using (auth.role() = 'service_role');
create policy "service role manages tracking" on tracking_events for all using (auth.role() = 'service_role');
