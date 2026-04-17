-- Drop no-op new-user trigger and its function (YAGNI — re-add when there is real logic to attach)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
