create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  balance bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider_deposit_id text unique not null,
  amount bigint not null,
  received bigint not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rumah_order_id text unique not null,
  service_code integer,
  service_name text not null,
  country_id integer not null,
  country_name text not null,
  provider_id text not null,
  operator_id integer not null,
  phone_number text not null,
  cost bigint not null,
  retail_price bigint not null,
  status text not null default 'received',
  otp_code text,
  otp_msg text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profit_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider_cost bigint not null,
  retail_price bigint not null,
  profit bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists deposits_user_id_idx on public.deposits(user_id);
