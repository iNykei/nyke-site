alter table public.profiles
add column if not exists banner_url text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-media',
  'profile-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public object URLs handle reads. These policies limit authenticated object
-- management to the owner's {user_id}/{avatar|banner}/... directory.
drop policy if exists "Profile media owners can read their objects" on storage.objects;
create policy "Profile media owners can read their objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('avatar', 'banner')
  and array_length(storage.foldername(name), 1) = 2
);

drop policy if exists "Profile media owners can upload" on storage.objects;
create policy "Profile media owners can upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('avatar', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "Profile media owners can update" on storage.objects;
create policy "Profile media owners can update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('avatar', 'banner')
  and array_length(storage.foldername(name), 1) = 2
)
with check (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('avatar', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "Profile media owners can delete" on storage.objects;
create policy "Profile media owners can delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('avatar', 'banner')
  and array_length(storage.foldername(name), 1) = 2
);
