-- GUESTBOOK
create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  display_name text not null,
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);
alter table public.guestbook enable row level security;

-- RLS: anyone can read; only authenticated can insert; only owner can delete
do $$
begin
  if not exists (select 1 from pg_policies where tablename='guestbook' and policyname='gb_select_all') then
    create policy "gb_select_all" on public.guestbook for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='guestbook' and policyname='gb_insert_auth') then
    create policy "gb_insert_auth" on public.guestbook for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='guestbook' and policyname='gb_delete_owner') then
    create policy "gb_delete_owner" on public.guestbook for delete using (auth.uid() = user_id);
  end if;
end$$;

-- POTLUCK (optional contributions beyond RSVP form)
create table if not exists public.potluck_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_name text not null check (char_length(item_name) between 2 and 80),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.potluck_items enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='potluck_items' and policyname='pl_select_all') then
    create policy "pl_select_all" on public.potluck_items for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='potluck_items' and policyname='pl_insert_auth') then
    create policy "pl_insert_auth" on public.potluck_items for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='potluck_items' and policyname='pl_delete_owner') then
    create policy "pl_delete_owner" on public.potluck_items for delete using (auth.uid() = user_id);
  end if;
end$$;

-- STORAGE bucket for gallery (public read, auth-only write)
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- RLS for storage.objects in bucket 'gallery'
create policy if not exists "gallery_read_public" on storage.objects
  for select using ( bucket_id = 'gallery' );

create policy if not exists "gallery_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'gallery' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "gallery_delete_owner" on storage.objects
  for delete using (
    bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]
  );