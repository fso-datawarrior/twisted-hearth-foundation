-- RLS policy tests for public.photos and related objects
-- Run in Supabase SQL Editor. Adjust UUIDs as needed.

-- Start as authenticated user A
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000A1","role":"authenticated"}', true);

-- Owner can insert own photo
insert into public.photos (user_id, storage_path, filename, caption, tags, category, is_approved, is_featured)
values (auth.uid(), 'user-uploads/'||auth.uid()||'/test.jpg', 'test.jpg', 'cap', '{}', 'general', false, false)
returning id into strict _photo_id;

-- Owner can see own unapproved photo
select count(*) as owner_can_see_unapproved from public.photos where id = _photo_id;

-- Switch to different authenticated user B
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000B2","role":"authenticated"}', true);
-- Other users cannot see unapproved photo
select count(*) as other_sees_unapproved from public.photos where id = _photo_id;

-- Approve photo via admin role (replace ADMIN_UUID)
select set_config('request.jwt.claims', '{"sub":"ADMIN_UUID","role":"authenticated"}', true);
update public.photos set is_approved = true where id = _photo_id;

-- Public (unauthenticated) can read approved photo (simulate anon)
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select count(*) as anon_sees_approved from public.photos where id = _photo_id;

-- Cleanup (optional if running in scratch schema)
-- delete from public.photos where id = _photo_id;