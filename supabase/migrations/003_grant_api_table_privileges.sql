-- PostgreSQL privileges and RLS form two separate authorization layers.
-- GRANT permits an API role to perform an operation; RLS limits which rows it may access or modify.

grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant update on table public.profiles to authenticated;

grant select on table public.player_settings to anon, authenticated;
grant insert, update, delete on table public.player_settings to authenticated;

grant select on table public.gear_items to anon, authenticated;

grant select on table public.player_gear to anon, authenticated;
grant insert, update, delete on table public.player_gear to authenticated;
