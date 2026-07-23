-- Fix: share preview uploads rejected with "new row violates row-level
-- security policy". Run in the Supabase SQL Editor.
--
-- The storage policies at the bottom of shared-decks.sql evidently didn't get
-- created (creating policies on storage.objects can fail depending on project
-- role/permissions, and a failure part-way through leaves the earlier
-- statements applied — which is why the table and bucket checked out while
-- uploads still failed). This drops and recreates just those three.
--
-- Diagnostic first — run this alone to see what exists today. Expect 3 rows
-- after this script; 0 rows is the bug.
--
--   select policyname, cmd from pg_policies
--   where schemaname = 'storage' and tablename = 'objects'
--     and policyname like '%share preview%';

drop policy if exists "Owners upload their share previews" on storage.objects;
drop policy if exists "Owners replace their share previews" on storage.objects;
drop policy if exists "Owners delete their share previews" on storage.objects;

-- Writes are scoped to shares the caller owns: object names are
-- "<share id>/<random>.jpg", so the first path segment must be the id of one of
-- their rows.
create policy "Owners upload their share previews"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'deck-previews'
    and exists (
      select 1 from public.shared_decks s
      where s.id = split_part(name, '/', 1)
        and s.owner_id = (select auth.uid())
    )
  );

create policy "Owners replace their share previews"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'deck-previews'
    and exists (
      select 1 from public.shared_decks s
      where s.id = split_part(name, '/', 1)
        and s.owner_id = (select auth.uid())
    )
  );

create policy "Owners delete their share previews"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'deck-previews'
    and exists (
      select 1 from public.shared_decks s
      where s.id = split_part(name, '/', 1)
        and s.owner_id = (select auth.uid())
    )
  );

-- Verify: expect three rows (INSERT / UPDATE / DELETE).
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like '%share preview%';
