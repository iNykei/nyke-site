begin;

-- Member numbers are permanent identity values. Hold profile writes while
-- existing rows are deterministically numbered and the sequence is aligned.
lock table public.profiles in access exclusive mode;

create sequence if not exists public.profiles_member_number_seq
as bigint
increment by 1
minvalue 1
no maxvalue
start with 1
cache 1;

alter table public.profiles
add column if not exists member_number bigint;

do $$
declare
  assigned_max bigint;
  sequence_last bigint;
  sequence_called boolean;
  backfill_base bigint;
begin
  select coalesce(max(member_number), 0)
  into assigned_max
  from public.profiles;

  select last_value, is_called
  into sequence_last, sequence_called
  from public.profiles_member_number_seq;

  backfill_base := greatest(
    assigned_max,
    case when sequence_called then sequence_last else 0 end
  );

  with ordered_profiles as (
    select
      id,
      backfill_base + row_number() over (order by created_at asc, id asc) as assigned_number
    from public.profiles
    where member_number is null
  )
  update public.profiles as profile
  set member_number = ordered_profiles.assigned_number
  from ordered_profiles
  where profile.id = ordered_profiles.id;

  select coalesce(max(member_number), 0)
  into assigned_max
  from public.profiles;

  select last_value, is_called
  into sequence_last, sequence_called
  from public.profiles_member_number_seq;

  if assigned_max = 0 and not sequence_called then
    perform setval(
      'public.profiles_member_number_seq'::regclass,
      greatest(sequence_last, 1),
      false
    );
  else
    perform setval(
      'public.profiles_member_number_seq'::regclass,
      greatest(assigned_max, sequence_last),
      true
    );
  end if;
end;
$$;

alter sequence public.profiles_member_number_seq
owned by public.profiles.member_number;

alter table public.profiles
alter column member_number set default nextval('public.profiles_member_number_seq'::regclass);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_member_number_positive'
  ) then
    alter table public.profiles
    add constraint profiles_member_number_positive check (member_number > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_member_number_key'
  ) then
    alter table public.profiles
    add constraint profiles_member_number_key unique (member_number);
  end if;
end;
$$;

alter table public.profiles
alter column member_number set not null;

create schema if not exists private;

create table if not exists private.identity_config (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint identity_config_key_check check (key in ('beta'))
);

alter table private.identity_config enable row level security;

insert into private.identity_config (key, enabled)
values ('beta', true)
on conflict (key) do nothing;

-- Disable future Beta awards without removing historical badges:
-- update private.identity_config set enabled = false, updated_at = now() where key = 'beta';

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  display_order smallint not null default 100,
  created_at timestamptz not null default now(),
  constraint badges_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint badges_display_order_positive check (display_order > 0)
);

create table if not exists public.profile_badges (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

create index if not exists profile_badges_badge_id_idx
on public.profile_badges (badge_id);

insert into public.badges (slug, name, description, display_order)
values
  ('founder', 'Founder', 'Founding identity in the NYKE community.', 10),
  ('first-10', 'First 10', 'One of the first ten registered NYKE members.', 20),
  ('early-100', 'Early 100', 'One of the first one hundred registered NYKE members.', 30),
  ('beta', 'Beta', 'Joined while NYKE public beta enrollment was active.', 40)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

-- Existing users receive only database-derived automatic badges. Founder is
-- intentionally excluded and must be assigned later using a verified UUID.
insert into public.profile_badges (profile_id, badge_id)
select profile.id, badge.id
from public.profiles as profile
join public.badges as badge
  on (badge.slug = 'first-10' and profile.member_number <= 10)
  or (badge.slug = 'early-100' and profile.member_number <= 100)
  or (
    badge.slug = 'beta'
    and exists (
      select 1
      from private.identity_config
      where key = 'beta' and enabled
    )
  )
on conflict (profile_id, badge_id) do nothing;

create or replace function private.award_profile_identity_badges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile_badges (profile_id, badge_id)
  select new.id, badge.id
  from public.badges as badge
  where (badge.slug = 'first-10' and new.member_number <= 10)
    or (badge.slug = 'early-100' and new.member_number <= 100)
    or (
      badge.slug = 'beta'
      and exists (
        select 1
        from private.identity_config
        where key = 'beta' and enabled
      )
    )
  on conflict (profile_id, badge_id) do nothing;

  return new;
end;
$$;

revoke all on function private.award_profile_identity_badges() from public, anon, authenticated;

drop trigger if exists profiles_award_identity_badges on public.profiles;
create trigger profiles_award_identity_badges
after insert on public.profiles
for each row
execute function private.award_profile_identity_badges();

alter table public.badges enable row level security;
alter table public.profile_badges enable row level security;

drop policy if exists "Public badges are readable" on public.badges;
create policy "Public badges are readable"
on public.badges
for select
to anon, authenticated
using (true);

drop policy if exists "Public profile badges are readable" on public.profile_badges;
create policy "Public profile badges are readable"
on public.profile_badges
for select
to anon, authenticated
using (true);

-- Table privileges and RLS are separate layers. The API roles may read badge
-- data, but no normal client receives permission to award or edit badges.
revoke all on table public.badges from anon, authenticated;
revoke all on table public.profile_badges from anon, authenticated;
grant select on table public.badges to anon, authenticated;
grant select on table public.profile_badges to anon, authenticated;

revoke all on schema private from public, anon, authenticated;
revoke all on table private.identity_config from public, anon, authenticated;

-- Preserve all current profile editing while keeping member_number immutable
-- to authenticated API clients.
revoke update on table public.profiles from authenticated;
grant update (
  username,
  display_name,
  avatar_url,
  banner_url,
  bio,
  region
) on table public.profiles to authenticated;

commit;
