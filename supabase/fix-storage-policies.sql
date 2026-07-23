-- Fix: share preview uploads rejected with "new row violates row-level
-- security policy". Run this whole file in the Supabase SQL Editor.
--
-- Why these policies check the role and not the user:
--
-- The obvious policy is "the leading path folder must equal auth.uid()", and
-- that is what this file used to contain. It fails in this project, and the
-- client's own diagnostics show why it cannot work:
--
--   path   6d2cad1b-f954-4817-9ba5-b573b779e539/<share id>-<random>.jpg
--   token  sub 6d2cad1b-f954-4817-9ba5-b573b779e539, role authenticated, unexpired
--
-- Same uuid on both sides, role resolved to `authenticated` (so the policy's
-- TO clause matched and the expression really was evaluated) — and still
-- refused. That only happens if auth.uid() is null inside the Storage
-- service's database session: Storage resolves the role but doesn't populate
-- the request.jwt claims that auth.uid() reads. No expression built on
-- auth.uid() can pass under those conditions.
--
-- So authorisation here is "signed in, and writing to this bucket". Creating a
-- share still requires a Discord login — that gate lives on public.shared_decks,
-- where auth.uid() does work — and preview objects keep the
-- <owner id>/<share id>-<random>.jpg layout, so they stay organised and
-- unguessable.
--
-- The trade: any signed-in user could in principle write to this bucket, or
-- delete a preview whose exact random path they already know. The blast radius
-- is a deck unfurling without a picture, which "Update snapshot" restores.
--
-- Safe to run repeatedly.

-- The bucket must exist and be public — link crawlers fetch og:image
-- unauthenticated.
insert into storage.buckets (id, name, public)
values ('deck-previews', 'deck-previews', true)
on conflict (id) do update set public = true;

drop policy if exists "Owners upload their share previews" on storage.objects;
drop policy if exists "Owners replace their share previews" on storage.objects;
drop policy if exists "Owners delete their share previews" on storage.objects;

create policy "Owners upload their share previews"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'deck-previews');

create policy "Owners replace their share previews"
  on storage.objects for update to authenticated
  using (bucket_id = 'deck-previews')
  with check (bucket_id = 'deck-previews');

create policy "Owners delete their share previews"
  on storage.objects for delete to authenticated
  using (bucket_id = 'deck-previews');

-- Verify: expect three rows (INSERT / UPDATE / DELETE).
select policyname, cmd, with_check, qual
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%share preview%';
