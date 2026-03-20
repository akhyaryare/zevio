-- ── LEADS ─────────────────────────────────────────────────────
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  business_name text,
  business_type text,
  plan          text,
  message       text,
  status        text not null default 'new' check (status in ('new','contacted','converted','lost')),
  source        text default 'website',
  created_at    timestamptz default now()
);

alter table leads enable row level security;

create policy if not exists "Public can insert leads"
  on leads for insert with check (true);

create policy if not exists "Authenticated users can read leads"
  on leads for select using (auth.role() = 'authenticated');

-- ── EMAIL QUEUE ────────────────────────────────────────────────
create table if not exists email_queue (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade,
  to_email    text not null,
  subject     text not null,
  html        text not null,
  send_after  timestamptz not null,
  sent_at     timestamptz,
  status      text not null default 'pending' check (status in ('pending','sent','failed')),
  sequence    integer not null default 1,
  created_at  timestamptz default now()
);

alter table email_queue enable row level security;

create policy if not exists "Service role can manage email_queue"
  on email_queue using (true);
