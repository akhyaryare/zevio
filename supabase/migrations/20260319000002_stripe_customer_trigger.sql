-- ============================================================
-- Zevio — Auto-provision Stripe customer on user signup
-- Uses pg_net (net.http_post) to call provision-stripe-customer
-- edge function asynchronously after business + membership created.
-- ============================================================

create extension if not exists pg_net schema extensions;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_business_id uuid;
  business_name   text;
begin
  business_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'business_name'), ''),
    split_part(new.email, '@', 1) || '''s Business'
  );

  -- Create business
  insert into businesses (name, owner_user_id, plan)
  values (business_name, new.id, 'Growth')
  returning id into new_business_id;

  -- Create membership
  insert into memberships (user_id, business_id, role)
  values (new.id, new_business_id, 'owner');

  -- Fire-and-forget: provision Stripe customer asynchronously
  perform net.http_post(
    url     := 'https://iovybemaglyntzbohpps.supabase.co/functions/v1/provision-stripe-customer',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdnliZW1hZ2x5bnR6Ym9ocHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MjU3OCwiZXhwIjoyMDg5MzU4NTc4fQ.9UBvgAajFxJEIGM0coDFR0m8ePGd74boGaQsa9zO-T0'
    ),
    body    := jsonb_build_object(
      'business_id',   new_business_id,
      'user_email',    new.email,
      'business_name', business_name
    )
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
