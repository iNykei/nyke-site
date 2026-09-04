begin;

-- Function execution privileges and RLS are separate security boundaries.
-- Trigger functions remain usable by their triggers without being callable by API roles.
alter function public.handle_new_user() set search_path = '';
alter function public.set_updated_at() set search_path = '';
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

-- Route-owned names cannot be claimed as public profile usernames.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_username_not_reserved'
  ) then
    alter table public.profiles
      add constraint profiles_username_not_reserved
      check (username <> all (array[
        '_next', 'api', 'auth', 'explore', 'favicon.ico', 'forgot-password',
        'gear', 'login', 'opengraph-image', 'register', 'reset-password',
        'robots.txt', 'settings', 'sitemap.xml'
      ]::text[]));
  end if;
end;
$$;

-- PostgreSQL table privileges decide which operations API roles may attempt;
-- RLS policies independently decide which rows those operations may affect.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.player_settings from anon, authenticated;
revoke all on table public.gear_items from anon, authenticated;
revoke all on table public.player_gear from anon, authenticated;
revoke all on table public.badges from anon, authenticated;
revoke all on table public.profile_badges from anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant update (username, display_name, avatar_url, banner_url, bio, region)
  on table public.profiles to authenticated;

grant select on table public.player_settings to anon, authenticated;
grant insert, update, delete on table public.player_settings to authenticated;

grant select on table public.gear_items to anon, authenticated;

grant select on table public.player_gear to anon, authenticated;
grant insert, update, delete on table public.player_gear to authenticated;

grant select on table public.badges to anon, authenticated;
grant select on table public.profile_badges to anon, authenticated;

revoke all on sequence public.profiles_member_number_seq from public, anon, authenticated;

-- Wrapping auth.uid() in a scalar subquery lets Postgres initialize it once per statement.
alter policy "Users can create their own profile" on public.profiles
  with check ((select auth.uid()) = id);
alter policy "Users can update their own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Users can create their own player settings" on public.player_settings
  with check ((select auth.uid()) = user_id);
alter policy "Users can update their own player settings" on public.player_settings
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "Users can delete their own player settings" on public.player_settings
  using ((select auth.uid()) = user_id);

alter policy "Users can create their own player gear" on public.player_gear
  with check ((select auth.uid()) = user_id);
alter policy "Users can update their own player gear" on public.player_gear
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "Users can delete their own player gear" on public.player_gear
  using ((select auth.uid()) = user_id);

commit;
