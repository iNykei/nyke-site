create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_-]{3,20}$'),
  constraint profiles_username_lowercase check (username = lower(username))
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Profile delete is disabled" on public.profiles;
create policy "Profile delete is disabled"
on public.profiles
for delete
to authenticated
using (false);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data->>'username', ''));

  if requested_username !~ '^[a-z0-9_-]{3,20}$' then
    raise exception 'invalid_username';
  end if;

  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    region
  )
  values (
    new.id,
    requested_username,
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'bio', ''),
    nullif(new.raw_user_meta_data->>'region', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
