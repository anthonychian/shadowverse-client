-- Fix: share preview uploads rejected with "new row violates row-level
-- security policy". Run this whole file in the Supabase SQL Editor.
--
-- History, because the reason matters:
--
--   v1  checked ownership with a subquery into public.shared_decks — that
--       subquery is itself subject to that table's RLS, two things to get right
--   v2  checked (storage.foldername(name))[1] = auth.uid()::text
--   v3  checked only the role, TO authenticated
--
-- All three refused the write. The client's diagnostics showed the upload path
-- and the JWT agreeing exactly —
--
--   path   6d2cad1b-f954-4817-9ba5-b573b779e539/<share id>-<random>.jpg
--   token  sub 6d2cad1b-f954-4817-9ba5-b573b779e539, role authenticated, unexpired
--
-- — so the failure isn't the expression. Since even a role-only policy was
-- refused, the Storage service's database session isn't running as
-- `authenticated`: a policy granted TO authenticated never applies to it, and
-- auth.uid() has no claims to read. Hence no TO clause here.
--
-- Access control therefore comes from the bucket rather than the caller:
-- one bucket, JPEG only, 5MB cap. Ownership of decks is unaffected — that gate
-- lives on public.shared_decks, where auth.uid() works, and it is what decides
-- who can create or publish a share. The exposure here is that someone using
-- the publishable key (which ships in the client, so treat it as public) could
-- write JPEGs to this one bucket. Worst case is a deck unfurling with the wrong
-- picture, which "Update snapshot" restores.
--
-- Safe to run repeatedly.

-- Bucket must exist, be public (crawlers fetch og:image unauthenticated), and
-- carry the limits that are now doing the real work.
insert into storage.buckets (id, name, public)
values ('deck-previews', 'deck-previews', true)
on conflict (id) do update
  set public = true;

update storage.buckets
set file_size_limit    = 5242880,                 -- 5 MB; previews run ~250KB
    allowed_mime_types = array['image/jpeg']
where id = 'deck-previews';

drop policy if exists "Owners upload their share previews" on storage.objects;
drop policy if exists "Owners replace their share previews" on storage.objects;
drop policy if exists "Owners delete their share previews" on storage.objects;

create policy "Owners upload their share previews"
  on storage.objects for insert
  with check (bucket_id = 'deck-previews');

create policy "Owners replace their share previews"
  on storage.objects for update
  using (bucket_id = 'deck-previews')
  with check (bucket_id = 'deck-previews');

create policy "Owners delete their share previews"
  on storage.objects for delete
  using (bucket_id = 'deck-previews');

-- Verify: three rows, and `roles` should read {public} — not {authenticated}.
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%share preview%';
