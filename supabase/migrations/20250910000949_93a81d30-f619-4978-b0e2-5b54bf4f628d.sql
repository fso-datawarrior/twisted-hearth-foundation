-- Drop the old version of submit_rsvp that doesn't handle idempotency
DROP FUNCTION IF EXISTS public.submit_rsvp(text, text, smallint, text, text, text);

-- Ensure we have the correct version that handles idempotency and returns proper table format
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_name text, 
  p_email text, 
  p_num_guests smallint, 
  p_costume_idea text, 
  p_dietary text, 
  p_contributions text, 
  p_idempotency uuid DEFAULT NULL::uuid
)
RETURNS TABLE(rsvp_id uuid, updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_user_id uuid;
  v_rsvp_id uuid;
  v_updated boolean := false;
begin
  select users.user_id into v_user_id from public.users where lower(users.email) = lower(p_email);
  if v_user_id is null then
    insert into public.users(name, email) values (p_name, p_email)
    returning users.user_id into v_user_id;
  else
    update public.users
      set name = coalesce(p_name, users.name), updated_at = now()
      where users.user_id = v_user_id;
  end if;

  insert into public.rsvps(user_id, num_guests, costume_idea, dietary_restrictions, contributions, status, updated_at, idempotency_token)
  values (v_user_id, coalesce(p_num_guests,1), p_costume_idea, p_dietary, p_contributions, 'pending', now(), p_idempotency)
  on conflict (user_id) do update
    set num_guests = excluded.num_guests,
        costume_idea = excluded.costume_idea,
        dietary_restrictions = excluded.dietary_restrictions,
        contributions = excluded.contributions,
        updated_at = now(),
        idempotency_token = coalesce(excluded.idempotency_token, rsvps.idempotency_token)
  returning rsvps.rsvp_id into v_rsvp_id;

  v_updated := true;
  return query select v_rsvp_id, v_updated;
end
$$;