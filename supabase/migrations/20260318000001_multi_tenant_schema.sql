-- ============================================================
-- Zevio — Multi-Tenant Schema Migration
-- ============================================================

-- Drop old tables that are being replaced
drop table if exists activity_log cascade;
drop table if exists messages cascade;
drop table if exists plans cascade;
drop table if exists clients cascade;

-- ── BUSINESSES ───────────────────────────────────────────────
create table if not exists businesses (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  owner_user_id        uuid not null references auth.users(id) on delete cascade,
  plan                 text not null default 'Growth' check (plan in ('Growth','Pro','Enterprise')),
  stripe_customer_id   text,
  whatsapp_number      text,
  created_at           timestamptz default now()
);

-- ── MEMBERSHIPS ──────────────────────────────────────────────
create table if not exists memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  business_id  uuid not null references businesses(id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner','admin','member')),
  unique(user_id, business_id)
);

-- ── CONTACTS ─────────────────────────────────────────────────
create table if not exists contacts (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  phone        text not null,
  name         text,
  created_at   timestamptz default now(),
  unique(business_id, phone)
);

-- ── CONVERSATIONS ─────────────────────────────────────────────
create table if not exists conversations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  contact_id   uuid not null references contacts(id) on delete cascade,
  created_at   timestamptz default now()
);

-- ── MESSAGES ─────────────────────────────────────────────────
create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  direction        text not null check (direction in ('inbound','outbound')),
  content          text not null,
  status           text not null default 'sent' check (status in ('sent','delivered','read','failed')),
  created_at       timestamptz default now()
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  business_id              uuid not null references businesses(id) on delete cascade,
  stripe_subscription_id   text unique,
  status                   text not null default 'active' check (status in ('active','past_due','cancelled','trialing')),
  current_period_end       timestamptz,
  created_at               timestamptz default now()
);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_memberships_user_id      on memberships(user_id);
create index if not exists idx_memberships_business_id  on memberships(business_id);
create index if not exists idx_contacts_business_id     on contacts(business_id);
create index if not exists idx_conversations_business   on conversations(business_id);
create index if not exists idx_messages_conversation    on messages(conversation_id);
create index if not exists idx_subscriptions_business   on subscriptions(business_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table businesses     enable row level security;
alter table memberships    enable row level security;
alter table contacts       enable row level security;
alter table conversations  enable row level security;
alter table messages       enable row level security;
alter table subscriptions  enable row level security;

-- Helper function: is the current user a member of a business?
create or replace function is_member(bid uuid)
returns boolean as $$
  select exists (
    select 1 from memberships
    where business_id = bid
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- BUSINESSES
create policy "members can read own business"
  on businesses for select using (is_member(id));

create policy "owner can update own business"
  on businesses for update using (owner_user_id = auth.uid());

create policy "authenticated users can create business"
  on businesses for insert with check (auth.uid() = owner_user_id);

-- MEMBERSHIPS
create policy "members can read own memberships"
  on memberships for select using (user_id = auth.uid() or is_member(business_id));

create policy "owner can manage memberships"
  on memberships for all using (
    exists (
      select 1 from businesses
      where id = business_id and owner_user_id = auth.uid()
    )
  );

create policy "user can insert own membership"
  on memberships for insert with check (user_id = auth.uid());

-- CONTACTS
create policy "members can read contacts"
  on contacts for select using (is_member(business_id));

create policy "members can insert contacts"
  on contacts for insert with check (is_member(business_id));

create policy "members can update contacts"
  on contacts for update using (is_member(business_id));

-- CONVERSATIONS
create policy "members can read conversations"
  on conversations for select using (is_member(business_id));

create policy "members can insert conversations"
  on conversations for insert with check (is_member(business_id));

-- MESSAGES
create policy "members can read messages"
  on messages for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and is_member(c.business_id)
    )
  );

create policy "members can insert messages"
  on messages for insert with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and is_member(c.business_id)
    )
  );

-- SUBSCRIPTIONS
create policy "members can read subscriptions"
  on subscriptions for select using (is_member(business_id));
