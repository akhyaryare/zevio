-- ============================================================
-- Zevio Platform — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── CLIENTS ─────────────────────────────────────────────────
create table if not exists clients (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  type         text not null,                        -- 'restaurant', 'barber', etc.
  plan         text not null check (plan in ('Growth','Pro','Enterprise')),
  mrr          integer not null,                     -- in GBP pence (29700 = £297)
  status       text not null default 'active' check (status in ('active','paused','cancelled')),
  email        text,
  phone        text,
  whatsapp_number text,                              -- 360Dialog linked number
  stripe_customer_id text,                           -- Stripe customer ID
  stripe_subscription_id text,                       -- Stripe subscription ID
  joined_at    timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── PLANS ───────────────────────────────────────────────────
create table if not exists plans (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null unique,
  price_gbp    integer not null,                     -- in pence
  description  text,
  features     jsonb default '[]',
  created_at   timestamptz default now()
);

-- Seed plans
insert into plans (name, price_gbp, description, features) values
  ('Growth',     29700, 'Growth plan for small businesses',
   '["WhatsApp automation","Review management","Basic analytics","Email support"]'),
  ('Pro',        49700, 'Pro plan for scaling businesses',
   '["Everything in Growth","Advanced AI responses","Priority support","Custom workflows","Detailed analytics"]'),
  ('Enterprise', 99700, 'Enterprise plan for large operations',
   '["Everything in Pro","Dedicated account manager","Custom integrations","SLA guarantee"]')
on conflict (name) do nothing;

-- ── MESSAGES (WhatsApp log) ──────────────────────────────────
create table if not exists messages (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid references clients(id) on delete cascade,
  direction    text not null check (direction in ('inbound','outbound')),
  from_number  text,
  to_number    text,
  body         text,
  status       text default 'delivered',
  sent_at      timestamptz default now(),
  created_at   timestamptz default now()
);

-- ── ACTIVITY LOG ────────────────────────────────────────────
create table if not exists activity_log (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid references clients(id) on delete set null,
  type         text not null,                        -- 'message_sent', 'review_replied', etc.
  description  text,
  meta         jsonb default '{}',
  created_at   timestamptz default now()
);

-- ── SEED CLIENTS ────────────────────────────────────────────
insert into clients (name, type, plan, mrr, status) values
  ('Damal Restaurant',   'restaurant', 'Growth', 29700, 'active'),
  ('Najma Restaurant',   'restaurant', 'Pro',    49700, 'active'),
  ('Star Barbers Hayes', 'barber',     'Growth', 29700, 'active')
on conflict do nothing;

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
alter table clients     enable row level security;
alter table plans       enable row level security;
alter table messages    enable row level security;
alter table activity_log enable row level security;

-- Allow authenticated users full access (admin only for now)
create policy "Authenticated users can read clients"
  on clients for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on clients for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on clients for update using (auth.role() = 'authenticated');

create policy "Authenticated users can read plans"
  on plans for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read messages"
  on messages for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert messages"
  on messages for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can read activity"
  on activity_log for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activity"
  on activity_log for insert with check (auth.role() = 'authenticated');

-- ── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row execute function handle_updated_at();

-- ── LEADS (waitlist / enquiries) ────────────────────────────
create table if not exists leads (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null,
  phone         text,
  business_name text,
  business_type text,                                -- 'restaurant','barber','salon','other'
  plan          text,                                -- plan they clicked from pricing
  message       text,
  status        text not null default 'new' check (status in ('new','contacted','converted','lost')),
  source        text default 'website',
  created_at    timestamptz default now()
);

alter table leads enable row level security;

-- Anyone can insert a lead (public form)
create policy "Public can insert leads"
  on leads for insert with check (true);

-- Only authenticated users can read leads
create policy "Authenticated users can read leads"
  on leads for select using (auth.role() = 'authenticated');
