-- USERS
create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  auth_provider_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RSVPS
create table if not exists public.rsvps (
  rsvp_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  num_guests int2 not null default 1 check (num_guests between 1 and 8),
  costume_idea text,
  dietary_restrictions text,
  contributions text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- SECURITY DEFINER RPC to upsert user + RSVP atomically
create or replace function public.submit_rsvp(
  p_name text,
  p_email text,
  p_num_guests int2,
  p_costume_idea text,
  p_dietary text,
  p_contributions text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_rsvp_id uuid;
begin
  select user_id into v_user_id from public.users where lower(email) = lower(p_email);
  if v_user_id is null then
    insert into public.users(name, email) values (p_name, p_email)
    returning user_id into v_user_id;
  else
    update public.users
      set name = coalesce(p_name, name), updated_at = now()
      where user_id = v_user_id;
  end if;

  insert into public.rsvps(user_id, num_guests, costume_idea, dietary_restrictions, contributions, status, updated_at)
  values (v_user_id, coalesce(p_num_guests,1), p_costume_idea, p_dietary, p_contributions, 'pending', now())
  on conflict (user_id) do update
    set num_guests = excluded.num_guests,
        costume_idea = excluded.costume_idea,
        dietary_restrictions = excluded.dietary_restrictions,
        contributions = excluded.contributions,
        updated_at = now()
  returning rsvp_id into v_rsvp_id;

  return v_rsvp_id;
end
$$;

grant execute on function public.submit_rsvp(text, text, int2, text, text, text) to anon, authenticated;

-- Enable RLS on tables and rely on the security-definer function for writes
alter table public.users enable row level security;
alter table public.rsvps enable row level security;

-- Minimal read policies (relaxed for this project)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rsvps' and policyname='select_own_rsvp'
  ) then
    create policy "select_own_rsvp" on public.rsvps
      for select using (true);
  end if;
end$$;