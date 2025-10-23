-- Track confirmation emails (observability)
alter table if exists public.rsvps
  add column if not exists email_sent_at timestamptz;

-- Prepare for deduping flaky submits
alter table if exists public.rsvps
  add column if not exists idempotency_token uuid;

-- Faster email lookups
create index if not exists users_email_lower_idx on public.users (lower(email));

-- Replace submit_rsvp to accept optional idempotency + return richer result
create or replace function public.submit_rsvp(
  p_name text,
  p_email text,
  p_num_guests int2,
  p_costume_idea text,
  p_dietary text,
  p_contributions text,
  p_idempotency uuid default null
) returns table(rsvp_id uuid, updated boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_rsvp_id uuid;
  v_updated boolean := false;
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

  insert into public.rsvps(user_id, num_guests, costume_idea, dietary_restrictions, contributions, status, updated_at, idempotency_token)
  values (v_user_id, coalesce(p_num_guests,1), p_costume_idea, p_dietary, p_contributions, 'pending', now(), p_idempotency)
  on conflict (user_id) do update
    set num_guests = excluded.num_guests,
        costume_idea = excluded.costume_idea,
        dietary_restrictions = excluded.dietary_restrictions,
        contributions = excluded.contributions,
        updated_at = now(),
        idempotency_token = coalesce(excluded.idempotency_token, public.rsvps.idempotency_token)
  returning rsvp_id into v_rsvp_id;

  v_updated := true;
  return query select v_rsvp_id, v_updated;
end
$$;

grant execute on function public.submit_rsvp(text, text, int2, text, text, text, uuid) to anon, authenticated;