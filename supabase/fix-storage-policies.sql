-- Fix: share preview uploads rejected with "new row violates row-level
-- security policy". Run this whole file in the Supabase SQL Editor.
--
-- Preview images upload to the `deck-previews` bucket at
--   <owner id>/<share id>-<random>.jpg
-- so a write can be authorised by checking the first path segment against
-- auth.uid(). The original policies instead ran a subquery back into
-- public.shared_decks; that has to satisfy *that* table's RLS as well, which is
-- a second thing to get wrong inside a storage policy. These have no subquery.
--
-- Safe to run more than once, and safe to run whether or not the earlier
-- policies exist.

-- Belt and braces: the bucket itself must exist and be public (link crawlers
-- fetch og:image unauthenticated). No-op if it's already there.
insert into storage.buckets (id, name, public)
values ('deck-previews', 'deck-previews', true)
on conflict (id) do update set public = true;

drop policy if exists "Owners upload their share previews" on storage.objects;
drop policy if exists "Owners replace their share previews" on storage.objects;
drop policy if exists "Owners delete their share previews" on storage.objects;

create policy "Owners upload their share previews"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'deck-previews'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners replace their share previews"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'deck-previews'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners delete their share previews"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'deck-previews'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Verify: expect three rows (INSERT / UPDATE / DELETE). Zero rows means the
-- policies still aren't being created — that's the thing to report, because it
-- means the SQL Editor can't write policies on storage.objects in this project
-- and they need creating from Storage → Policies in the dashboard instead.
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%share preview%';
