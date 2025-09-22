-- RLS policy tests for public.rsvps
-- Run in Supabase SQL editor. Adjust UUIDs to match your project users.

-- Helper: simulate authenticated user A
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000A1","role":"authenticated"}', true);
-- Expect: selecting own row is allowed; others are filtered
select count(*) as own_rows from public.rsvps where user_id = auth.uid();
select count(*) as other_rows_visible from public.rsvps where user_id <> auth.uid();

-- Expect: can insert only with user_id = auth.uid()
-- should succeed
insert into public.rsvps (user_id, status, num_guests) values (auth.uid(), 'confirmed', 1) on conflict do nothing;
-- should fail (check policy)
-- insert into public.rsvps (user_id, status, num_guests) values ('00000000-0000-0000-0000-0000000000B2', 'confirmed', 1);

-- Switch to a different user B
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000B2","role":"authenticated"}', true);
select count(*) as own_rows_b from public.rsvps where user_id = auth.uid();
select count(*) as other_rows_visible_b from public.rsvps where user_id <> auth.uid();

-- Admin checks (requires your admin user id to be present in public.user_roles)
-- Replace ADMIN_UUID with a real admin user id from your project
select set_config('request.jwt.claims', '{"sub":"ADMIN_UUID","role":"authenticated"}', true);
-- Expect: admin can see all rows per policies
select count(*) as total_visible_to_admin from public.rsvps;
