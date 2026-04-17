-- M03: Auth helpers — JWT accessor + new-user trigger

-- 1. Helper: read dealer_id from the current JWT's app_metadata
create or replace function get_my_dealer_id()
returns uuid
language sql stable
as $$
  select (auth.jwt() -> 'app_metadata' ->> 'dealer_id')::uuid;
$$;

-- 2. Trigger function: hook point for new user inserts
--    app_metadata (role, dealer_id) is set by the invite flow before the row
--    is inserted, so no copying is needed here.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- app_metadata is set by the invite flow before the row is inserted.
  -- Nothing to do here — the metadata is already on the user.
  -- This trigger exists as a hook point for future logic.
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3. Grant execute on get_my_dealer_id() to authenticated role
grant execute on function get_my_dealer_id() to authenticated;
