-- Add RLS policy for users table to resolve security warning
create policy "select_users_policy" on public.users
  for select using (true);