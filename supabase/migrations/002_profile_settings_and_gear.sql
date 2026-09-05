create extension if not exists pgcrypto;

create table if not exists public.player_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game text,
  rank text,
  dpi integer,
  sensitivity numeric,
  resolution text,
  polling_rate integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_settings_one_per_user unique (user_id),
  constraint player_settings_dpi_range check (dpi is null or (dpi between 100 and 12800)),
  constraint player_settings_sensitivity_range check (sensitivity is null or (sensitivity > 0 and sensitivity <= 20)),
  constraint player_settings_polling_rate_range check (polling_rate is null or (polling_rate between 125 and 8000))
);

create table if not exists public.gear_items (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  category text not null,
  created_at timestamptz not null default now(),
  constraint gear_items_category_check check (category in ('mouse', 'mousepad', 'keyboard', 'monitor', 'headset', 'skates')),
  constraint gear_items_unique_model unique (category, brand, model)
);

create table if not exists public.player_gear (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gear_item_id uuid not null references public.gear_items(id) on delete restrict,
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint player_gear_category_check check (category in ('mouse', 'mousepad', 'keyboard', 'monitor', 'headset', 'skates'))
);

create unique index if not exists player_gear_one_active_category
on public.player_gear (user_id, category)
where is_active;

create index if not exists player_settings_user_id_idx on public.player_settings (user_id);
create index if not exists gear_items_category_idx on public.gear_items (category);
create index if not exists player_gear_user_id_idx on public.player_gear (user_id);
create index if not exists player_gear_item_id_idx on public.player_gear (gear_item_id);

drop trigger if exists player_settings_set_updated_at on public.player_settings;
create trigger player_settings_set_updated_at
before update on public.player_settings
for each row
execute function public.set_updated_at();

alter table public.player_settings enable row level security;
alter table public.gear_items enable row level security;
alter table public.player_gear enable row level security;

drop policy if exists "Public player settings are readable" on public.player_settings;
create policy "Public player settings are readable"
on public.player_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Users can create their own player settings" on public.player_settings;
create policy "Users can create their own player settings"
on public.player_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own player settings" on public.player_settings;
create policy "Users can update their own player settings"
on public.player_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own player settings" on public.player_settings;
create policy "Users can delete their own player settings"
on public.player_settings
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Public gear items are readable" on public.gear_items;
create policy "Public gear items are readable"
on public.gear_items
for select
to anon, authenticated
using (true);

drop policy if exists "Public player gear is readable" on public.player_gear;
create policy "Public player gear is readable"
on public.player_gear
for select
to anon, authenticated
using (true);

drop policy if exists "Users can create their own player gear" on public.player_gear;
create policy "Users can create their own player gear"
on public.player_gear
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own player gear" on public.player_gear;
create policy "Users can update their own player gear"
on public.player_gear
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own player gear" on public.player_gear;
create policy "Users can delete their own player gear"
on public.player_gear
for delete
to authenticated
using (user_id = auth.uid());

insert into public.gear_items (brand, model, category)
values
  ('Razer', 'Viper V3 Pro', 'mouse'),
  ('Logitech G', 'G Pro X Superlight 2', 'mouse'),
  ('ZOWIE', 'U2-DW', 'mouse'),
  ('ARTISAN', 'Zero Soft XL', 'mousepad'),
  ('SteelSeries', 'QcK Heavy', 'mousepad'),
  ('Lethal Gaming Gear', 'Saturn Pro', 'mousepad'),
  ('Wooting', '60HE', 'keyboard'),
  ('DrunkDeer', 'A75', 'keyboard'),
  ('ASUS', 'XG27ACDNG', 'monitor'),
  ('ZOWIE', 'XL2566K', 'monitor'),
  ('HyperX', 'Cloud III', 'headset'),
  ('Logitech G', 'Pro X 2', 'headset'),
  ('Corepad', 'Pro Dots', 'skates'),
  ('Esports Tiger', 'ICE V2', 'skates')
on conflict (category, brand, model) do nothing;
