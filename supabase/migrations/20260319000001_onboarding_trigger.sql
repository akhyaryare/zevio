-- ============================================================
-- Zevio — Onboarding trigger + RLS policy cleanup
-- ============================================================

-- ── 1. RECREATE RLS POLICIES CLEANLY ─────────────────────
-- businesses
drop policy if exists "members can read own business"          on businesses;
drop policy if exists "owner can update own business"          on businesses;
drop policy if exists "authenticated users can create business" on businesses;

create policy "members can read own business"
  on businesses for select using (is_member(id));

create policy "owner can update own business"
  on businesses for update using (owner_user_id = auth.uid());

create policy "authenticated users can create business"
  on businesses for insert with check (auth.uid() = owner_user_id);

-- memberships
drop policy if exists "members can read own memberships" on memberships;
drop policy if exists "owner can manage memberships"     on memberships;
drop policy if exists "user can insert own membership"   on memberships;

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

-- ── 2. AUTO-PROVISION BUSINESS + MEMBERSHIP ON SIGNUP ────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_business_id uuid;
begin
  insert into businesses (name, owner_user_id, plan)
  values (
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'business_name'), ''),
      split_part(new.email, '@', 1) || '''s Business'
    ),
    new.id,
    'Growth'
  )
  returning id into new_business_id;

  insert into memberships (user_id, business_id, role)
  values (new.id, new_business_id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── 3. BACKFILL EXISTING USERS WITHOUT A BUSINESS ────────
do $$
declare
  u record;
  new_business_id uuid;
begin
  for u in
    select au.id, au.email
    from auth.users au
    where not exists (
      select 1 from memberships m where m.user_id = au.id
    )
  loop
    insert into businesses (name, owner_user_id, plan)
    values (split_part(u.email, '@', 1) || '''s Business', u.id, 'Growth')
    returning id into new_business_id;

    insert into memberships (user_id, business_id, role)
    values (u.id, new_business_id, 'owner');
  end loop;
end;
$$;
