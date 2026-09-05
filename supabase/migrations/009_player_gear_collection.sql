begin;

-- Keep existing rows and the one-active-per-category index intact.
-- Lock writes so the duplicate audit and new constraint see the same data.
lock table public.player_gear in share row exclusive mode;

do $$
begin
  if exists (
    select 1 from public.player_gear
    group by user_id, gear_item_id having count(*) > 1
  ) then
    raise exception 'Duplicate player gear exists; review those rows before applying this migration.';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.player_gear'::regclass
      and conname = 'player_gear_user_item_key'
  ) then
    alter table public.player_gear
      add constraint player_gear_user_item_key unique (user_id, gear_item_id);
  end if;
end;
$$;

-- Both updates belong to one transaction: failure preserves the old loadout.
-- INVOKER retains the caller's table permissions and owner RLS policies.
create or replace function public.set_active_player_gear(p_gear_item_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_gear public.player_gear%rowtype;
begin
  if current_user_id is null then
    raise exception 'Sign in to manage gear.' using errcode = '42501';
  end if;

  -- Serialize active switches for this owner, including different browser tabs.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('player-gear:' || current_user_id::text, 0));

  select * into selected_gear from public.player_gear
  where user_id = current_user_id and gear_item_id = p_gear_item_id
  for update;

  if not found then
    raise exception 'Gear is not in your collection.' using errcode = 'P0002';
  end if;

  update public.player_gear set is_active = false
  where user_id = current_user_id and category = selected_gear.category
    and is_active and id <> selected_gear.id;

  update public.player_gear set is_active = true
  where user_id = current_user_id and id = selected_gear.id;

  if not found then
    raise exception 'Gear could not be activated.' using errcode = 'P0002';
  end if;
  return selected_gear.id;
end;
$$;

revoke execute on function public.set_active_player_gear(uuid) from public, anon;
grant execute on function public.set_active_player_gear(uuid) to authenticated;

commit;
