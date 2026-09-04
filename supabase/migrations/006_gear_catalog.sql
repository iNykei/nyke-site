-- Gear catalog metadata remains publicly readable under the existing RLS policy and SELECT grants.
-- This migration only adds presentation metadata and preserves every existing gear UUID/reference.
begin;

alter table public.gear_items
  add column if not exists image_url text,
  add column if not exists specs jsonb not null default '{}'::jsonb,
  add column if not exists source_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.gear_items'::regclass
      and conname = 'gear_items_specs_object_check'
  ) then
    alter table public.gear_items
      add constraint gear_items_specs_object_check
      check (jsonb_typeof(specs) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.gear_items'::regclass
      and conname = 'gear_items_image_url_check'
  ) then
    alter table public.gear_items
      add constraint gear_items_image_url_check
      check (image_url is null or image_url ~ '^/gear/[a-z0-9]+(-[a-z0-9]+)*[.]webp$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.gear_items'::regclass
      and conname = 'gear_items_source_url_check'
  ) then
    alter table public.gear_items
      add constraint gear_items_source_url_check
      check (source_url is null or source_url ~ '^https://');
  end if;
end
$$;

insert into public.gear_items (brand, model, category, image_url, specs, source_url)
values
  ('Razer', 'Viper V3 Pro', 'mouse', '/gear/razer-viper-v3-pro.webp', '{"weight":"54 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.razer.com/gaming-mice/razer-viper-v3-pro'),
  ('Razer', 'DeathAdder V3 Pro', 'mouse', null, '{"weight":"63 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.razer.com/gaming-mice/razer-deathadder-v3-pro'),
  ('Razer', 'Viper V3 HyperSpeed', 'mouse', null, '{"weight":"82 g","polling_rate":"4000 Hz"}'::jsonb, 'https://www.razer.com/gaming-mice/razer-viper-v3-hyperspeed'),
  ('Logitech G', 'G Pro X Superlight 2', 'mouse', '/gear/logitech-g-g-pro-x-superlight-2.webp', '{"weight":"60 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.logitechg.com/en-us/products/gaming-mice/pro-x2-superlight-wireless-mouse.html'),
  ('Logitech G', 'G Pro X Superlight', 'mouse', null, '{"weight":"63 g","polling_rate":"1000 Hz"}'::jsonb, 'https://www.logitechg.com/en-us/products/gaming-mice/pro-x-superlight-wireless-mouse.html'),
  ('ZOWIE', 'U2-DW', 'mouse', '/gear/zowie-u2-dw.webp', '{"polling_rate":"4000 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/mouse/u2-dw.html'),
  ('ZOWIE', 'EC2-CW', 'mouse', null, '{"polling_rate":"1000 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/mouse/ec2-cw.html'),
  ('ZOWIE', 'FK2-DW', 'mouse', null, '{"polling_rate":"4000 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/mouse/fk2-dw.html'),
  ('Pulsar', 'X2V2', 'mouse', null, '{"weight":"53 g","polling_rate":"4000 Hz"}'::jsonb, 'https://www.pulsar.gg/products/x2v2-gaming-mouse'),
  ('Pulsar', 'Xlite V3', 'mouse', null, '{"weight":"55 g","polling_rate":"4000 Hz"}'::jsonb, 'https://www.pulsar.gg/products/xlite-v3-gaming-mouse'),
  ('Lamzu', 'Atlantis Mini Pro', 'mouse', null, '{"weight":"51 g","polling_rate":"4000 Hz"}'::jsonb, 'https://lamzu.com/products/lamzu-atlantis-mini-pro'),
  ('Lamzu', 'Maya X', 'mouse', null, '{"weight":"47 g","polling_rate":"8000 Hz"}'::jsonb, 'https://lamzu.com/products/lamzu-maya-x'),
  ('WLMouse', 'Beast X Max', 'mouse', null, '{"weight":"42 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.wlmouse.com/products/beast-x-max'),
  ('WLMouse', 'Sword X', 'mouse', null, '{"weight":"47 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.wlmouse.com/products/sword-x'),
  ('VAXEE', 'XE Wireless', 'mouse', null, '{"weight":"76 g","polling_rate":"4000 Hz"}'::jsonb, 'https://www.vaxee.co/en/product.php?act=view&id=153'),
  ('VAXEE', 'NP-01S Wireless', 'mouse', null, '{"weight":"68 g","polling_rate":"4000 Hz"}'::jsonb, 'https://www.vaxee.co/en/product.php?act=view&id=167'),
  ('Finalmouse', 'UltralightX', 'mouse', null, '{"polling_rate":"8000 Hz"}'::jsonb, 'https://finalmouse.com/products/ultralightx'),
  ('Finalmouse', 'Starlight-12', 'mouse', null, '{}'::jsonb, 'https://finalmouse.com/'),
  ('Endgame Gear', 'OP1 8K', 'mouse', null, '{"weight":"51.5 g","polling_rate":"8000 Hz"}'::jsonb, 'https://www.endgamegear.com/en-us/gaming-mice/op1-8k'),
  ('Ninjutso', 'Sora V2', 'mouse', null, '{"weight":"39 g","polling_rate":"8000 Hz"}'::jsonb, 'https://ninjutso.com/products/ninjutso-sora-v2'),
  ('Wooting', '60HE', 'keyboard', '/gear/wooting-60he.webp', '{"layout":"60%","switch_type":"Hall effect"}'::jsonb, 'https://wooting.io/wooting-60he'),
  ('Wooting', '80HE', 'keyboard', null, '{"layout":"80%","switch_type":"Hall effect"}'::jsonb, 'https://wooting.io/wooting-80he'),
  ('Razer', 'Huntsman V3 Pro Mini', 'keyboard', null, '{"layout":"60%","switch_type":"Analog optical"}'::jsonb, 'https://www.razer.com/gaming-keyboards/razer-huntsman-v3-pro-mini'),
  ('Razer', 'Huntsman V3 Pro TKL', 'keyboard', null, '{"layout":"TKL","switch_type":"Analog optical"}'::jsonb, 'https://www.razer.com/gaming-keyboards/razer-huntsman-v3-pro-tenkeyless'),
  ('SteelSeries', 'Apex Pro Mini Wireless', 'keyboard', null, '{"layout":"60%","switch_type":"Hall effect"}'::jsonb, 'https://steelseries.com/gaming-keyboards/apex-pro-mini-wireless'),
  ('SteelSeries', 'Apex Pro TKL Gen 3', 'keyboard', null, '{"layout":"TKL","switch_type":"Hall effect"}'::jsonb, 'https://steelseries.com/gaming-keyboards/apex-pro-tkl-gen-3'),
  ('DrunkDeer', 'A75', 'keyboard', '/gear/drunkdeer-a75.webp', '{"layout":"75%","switch_type":"Hall effect"}'::jsonb, 'https://drunkdeer.com/products/drunkdeer-a75'),
  ('DrunkDeer', 'G60', 'keyboard', null, '{"layout":"60%","switch_type":"Hall effect"}'::jsonb, 'https://drunkdeer.com/products/drunkdeer-g60'),
  ('Keychron', 'Q1 HE', 'keyboard', null, '{"layout":"75%","switch_type":"Hall effect"}'::jsonb, 'https://www.keychron.com/products/keychron-q1-he-qmk-wireless-custom-keyboard'),
  ('Keychron', 'K2 HE', 'keyboard', null, '{"layout":"75%","switch_type":"Hall effect"}'::jsonb, 'https://www.keychron.com/products/keychron-k2-he-wireless-magnetic-switch-keyboard'),
  ('ASUS', 'ROG Falchion Ace HFX', 'keyboard', null, '{"layout":"65%","switch_type":"Hall effect"}'::jsonb, 'https://rog.asus.com/keyboards/keyboards/compact/rog-falchion-ace-hfx/'),
  ('ASUS', 'ROG Azoth Extreme', 'keyboard', null, '{"layout":"75%","switch_type":"Mechanical"}'::jsonb, 'https://rog.asus.com/keyboards/keyboards/compact/rog-azoth-extreme/'),
  ('ARTISAN', 'Zero Soft XL', 'mousepad', null, '{"surface":"Cloth","size":"XL"}'::jsonb, 'https://artisan-jp.com/nj_index_eng.html/'),
  ('ARTISAN', 'Hien Soft XL', 'mousepad', null, '{"surface":"Cloth","size":"XL"}'::jsonb, 'https://artisan-jp.com/nj_index_eng.html/'),
  ('ARTISAN', 'Type-99 Soft XL', 'mousepad', null, '{"surface":"Cloth","size":"XL"}'::jsonb, 'https://artisan-jp.com/nj_index_eng.html/'),
  ('Lethal Gaming Gear', 'Saturn Pro', 'mousepad', null, '{"surface":"Cloth"}'::jsonb, 'https://www.lethal.gg/products/saturn-pro-series'),
  ('Lethal Gaming Gear', 'Venus Pro', 'mousepad', null, '{"surface":"Cloth"}'::jsonb, 'https://www.lethal.gg/products/venus-pro-series'),
  ('SteelSeries', 'QcK Heavy', 'mousepad', '/gear/steelseries-qck-heavy.webp', '{"surface":"Micro-woven cloth"}'::jsonb, 'https://steelseries.com/gaming-mousepads/qck-heavy'),
  ('SteelSeries', 'QcK+', 'mousepad', null, '{"surface":"Micro-woven cloth"}'::jsonb, 'https://steelseries.com/gaming-mousepads/qck-series'),
  ('ZOWIE', 'G-SR-SE Rouge', 'mousepad', null, '{"surface":"Cloth"}'::jsonb, 'https://zowie.benq.com/en-us/mouse-pad/g-sr-se-rouge.html'),
  ('ZOWIE', 'G-SR II', 'mousepad', null, '{"surface":"Cloth"}'::jsonb, 'https://zowie.benq.com/en-us/mouse-pad/g-sr-ii.html'),
  ('X-raypad', 'Aqua Control II', 'mousepad', null, '{"surface":"Hybrid cloth"}'::jsonb, 'https://shop.x-raypad.com/shop/x-raypad-aqua-control-ii-gaming-mouse-pads/'),
  ('X-raypad', 'Aqua Control Pro', 'mousepad', null, '{"surface":"Hybrid cloth"}'::jsonb, 'https://shop.x-raypad.com/shop/x-raypad-aqua-control-pro-gaming-mouse-pad/'),
  ('Wallhack', 'SP-004', 'mousepad', null, '{"surface":"Glass"}'::jsonb, 'https://wallhack.com/products/sp-004'),
  ('ASUS', 'XG27ACDNG', 'monitor', '/gear/asus-xg27acdng.webp', '{"resolution":"2560 × 1440","refresh_rate":"360 Hz"}'::jsonb, 'https://rog.asus.com/monitors/27-to-31-5-inches/rog-strix-oled-xg27acdng/'),
  ('ASUS', 'PG248QP', 'monitor', null, '{"resolution":"1920 × 1080","refresh_rate":"540 Hz"}'::jsonb, 'https://rog.asus.com/monitors/23-to-24-5-inches/rog-swift-pro-pg248qp/'),
  ('ZOWIE', 'XL2566K', 'monitor', null, '{"resolution":"1920 × 1080","refresh_rate":"360 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/monitor/xl2566k.html'),
  ('ZOWIE', 'XL2586X+', 'monitor', null, '{"resolution":"1920 × 1080","refresh_rate":"600 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/monitor/xl2586x-plus.html'),
  ('ZOWIE', 'XL2546X+', 'monitor', null, '{"resolution":"1920 × 1080","refresh_rate":"280 Hz"}'::jsonb, 'https://zowie.benq.com/en-us/monitor/xl2546x-plus.html'),
  ('Alienware', 'AW2524H', 'monitor', null, '{"resolution":"1920 × 1080","refresh_rate":"500 Hz"}'::jsonb, 'https://www.dell.com/en-us/shop/alienware-500hz-gaming-monitor-aw2524h/apd/210-bglm/monitors-monitor-accessories'),
  ('Alienware', 'AW2725DF', 'monitor', null, '{"resolution":"2560 × 1440","refresh_rate":"360 Hz"}'::jsonb, 'https://www.dell.com/en-us/shop/alienware-27-360hz-qd-oled-gaming-monitor-aw2725df/apd/210-bljd/monitors-monitor-accessories'),
  ('LG', '27GS95QE-B', 'monitor', null, '{"resolution":"2560 × 1440","refresh_rate":"240 Hz"}'::jsonb, 'https://www.lg.com/us/monitors/lg-27gs95qe-b-gaming-monitor'),
  ('Samsung', 'Odyssey OLED G6 G60SD', 'monitor', null, '{"resolution":"2560 × 1440","refresh_rate":"360 Hz"}'::jsonb, 'https://www.samsung.com/us/computing/monitors/gaming/27-odyssey-oled-g6-g60sd-qhd-360hz-0-03ms-freesync-premium-pro-gaming-monitor-ls27dg602snxza/'),
  ('ASUS', 'PG27AQDP', 'monitor', null, '{"resolution":"2560 × 1440","refresh_rate":"480 Hz"}'::jsonb, 'https://rog.asus.com/monitors/27-to-31-5-inches/rog-swift-oled-pg27aqdp/'),
  ('HyperX', 'Cloud III', 'headset', null, '{"connection":"Wired"}'::jsonb, 'https://hyperx.com/products/hyperx-cloud-iii-wired-gaming-headset'),
  ('HyperX', 'Cloud III Wireless', 'headset', null, '{"connection":"Wireless","battery_life":"Up to 120 hours"}'::jsonb, 'https://hyperx.com/products/hyperx-cloud-iii-wireless-gaming-headset'),
  ('Logitech G', 'Pro X 2', 'headset', null, '{"connection":"Wireless","battery_life":"Up to 50 hours"}'::jsonb, 'https://www.logitechg.com/en-us/products/gaming-audio/pro-x-2-wireless-headset.981-001262.html'),
  ('Logitech G', 'Astro A50 X', 'headset', null, '{"connection":"Wireless","battery_life":"Up to 24 hours"}'::jsonb, 'https://www.logitechg.com/en-us/products/gaming-audio/a50-x-astro-wireless-headset-base-station.html'),
  ('SteelSeries', 'Arctis Nova Pro Wireless', 'headset', null, '{"connection":"Wireless"}'::jsonb, 'https://steelseries.com/gaming-headsets/arctis-nova-pro-wireless'),
  ('SteelSeries', 'Arctis Nova 7', 'headset', null, '{"connection":"Wireless"}'::jsonb, 'https://steelseries.com/gaming-headsets/arctis-nova-7'),
  ('Razer', 'BlackShark V2 Pro', 'headset', null, '{"connection":"Wireless","battery_life":"Up to 70 hours"}'::jsonb, 'https://www.razer.com/gaming-headsets/razer-blackshark-v2-pro-2023'),
  ('Razer', 'BlackShark V2 HyperSpeed', 'headset', null, '{"connection":"Wireless","battery_life":"Up to 70 hours"}'::jsonb, 'https://www.razer.com/gaming-headsets/razer-blackshark-v2-hyperspeed'),
  ('EPOS', 'H6PRO Closed', 'headset', null, '{"connection":"Wired"}'::jsonb, 'https://www.eposaudio.com/en/us/gaming/products/h6pro-closed-green-gaming-headset-1000969'),
  ('EPOS', 'GSP 600', 'headset', null, '{"connection":"Wired"}'::jsonb, 'https://www.eposaudio.com/en/us/gaming/products/gsp-600-gaming-headset-1000244'),
  ('Corepad', 'Pro Dots', 'skates', null, '{"material":"PTFE","format":"Dots"}'::jsonb, 'https://www.corepad.de/en/Corepad-Skatez-PRO/'),
  ('Corepad', 'Skatez PRO 280', 'skates', null, '{"material":"PTFE"}'::jsonb, 'https://www.corepad.de/en/Corepad-Skatez-PRO/'),
  ('Esports Tiger', 'ICE V2', 'skates', null, '{"material":"PTFE"}'::jsonb, null),
  ('Esports Tiger', 'Arc 1', 'skates', null, '{"material":"PTFE"}'::jsonb, null),
  ('X-raypad', 'Obsidian Dot', 'skates', null, '{"material":"Hardened PTFE","format":"Dots"}'::jsonb, 'https://shop.x-raypad.com/shop/xraypad-obsidian-mouse-skates-universal-diy-dots/'),
  ('X-raypad', 'Jade Dot', 'skates', null, '{"material":"PTFE","format":"Dots"}'::jsonb, 'https://shop.x-raypad.com/shop/xraypad-jade-mouse-skates-universal-diy-dots/'),
  ('X-raypad', 'Obsidian Pro Air', 'skates', null, '{"format":"Dots"}'::jsonb, 'https://shop.x-raypad.com/shop/xraypad-obsidian-pro-air-mouse-skates-universal-diy-dots/'),
  ('Pulsar', 'Superglide 2', 'skates', null, '{"material":"Glass"}'::jsonb, 'https://www.pulsar.gg/products/superglide-2')
on conflict (category, brand, model) do update
set image_url = excluded.image_url,
    specs = excluded.specs,
    source_url = excluded.source_url;

commit;
