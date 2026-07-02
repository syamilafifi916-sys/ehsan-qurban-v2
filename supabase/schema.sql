create extension if not exists pgcrypto;

create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  contact_name text,
  contact_phone text,
  bank_name text,
  bank_account_name text,
  bank_account_no text,
  created_at timestamptz default now()
);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('super_admin','admin','bendahari','ajk_pendaftaran')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now(),
  last_login timestamptz
);

create table if not exists cows (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  cow_no int not null,
  group_name text not null,
  max_slots int not null default 7,
  price_per_slot numeric(12,2) not null default 0,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz default now(),
  unique(organisation_id, cow_no)
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  cow_id uuid references cows(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  payment_plan text not null default 'full' check (payment_plan in ('full','installment')),
  installment_months int,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  created_at timestamptz default now(),
  approved_at timestamptz
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  amount numeric(12,2) not null,
  method text not null check (method in ('online','transfer','cash')),
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  payment_month text,
  slip_url text,
  verified_by uuid references admins(id),
  verified_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  admin_id uuid references admins(id) on delete set null,
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

insert into organisations (name, slug, contact_name, contact_phone)
values ('Surau Dakwatul Islamiah Kebun Baru', 'sdikb', 'Pihak Pengurusan', '60123456789')
on conflict (slug) do nothing;
