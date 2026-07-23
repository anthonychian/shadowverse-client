-- Public deck sharing (run once in the Supabase SQL Editor, after schema.sql).
--
-- A "share" is a frozen snapshot of one deck plus a short slug used as its URL:
--   https://sveclient.vercel.app/decks/<id>
-- Creating one requires a signed-in (Discord) user: the insert policy checks
-- auth.uid(), so the login gate lives in the database rather than the UI and
-- can't be bypassed by hand-crafting a request.
--
-- Reading is open to anyone, but only while `is_public` is true. Flipping it
-- off makes the link 404 for everyone except the owner without losing the row,
-- and flipping it back on revives the same URL.
--
-- The snapshot in `deck` has exactly the shape the local/cloud deck lists use:
--   { name, class, deck: [names], evoDeck: [names], art: {name: cardNo} }
-- so the share page renders it with the same components as the Home preview.

create table public.shared_decks (
  id          text primary key,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  -- Discord display name captured at share time, so the share page can credit
  -- the author without exposing the auth.users row to public readers.
  owner_name  text,
  deck        jsonb not null,
  is_public   boolean not null default false,
  -- Object name in the `deck-previews` bucket, or null when there's no preview
  -- image (private share, or generation failed).
  image_path  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The Share dialog looks up "does this deck already have a link?" by owner and
-- deck name, newest first.
create index shared_decks_owner_idx
  on public.shared_decks (owner_id, created_at desc);

alter table public.shared_decks enable row level security;

create policy "Public shares are readable by anyone"
  on public.shared_decks for select
  using (is_public or (select auth.uid()) = owner_id);

create policy "Signed-in users create their own shares"
  on public.shared_decks for insert
  with check ((select auth.uid()) = owner_id);

create policy "Owners update their shares"
  on public.shared_decks for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners delete their shares"
  on public.shared_decks for delete
  using ((select auth.uid()) = owner_id);


-- ---------------------------------------------------------------------------
-- Preview images
-- ---------------------------------------------------------------------------
-- Each share's og:image (what Discord/Twitter unfurl) is a JPEG the sharer's
-- browser renders at share time and uploads here. The bucket is public because
-- link crawlers fetch it unauthenticated; object names are
-- "<owner id>/<share id>-<random>.jpg" so a private share's image isn't
-- guessable from its slug, and the client deletes the object whenever a share
-- is switched back to private.
--
-- NOTE: if uploads fail with "new row violates row-level security policy", the
-- policies below didn't get created — run supabase/fix-storage-policies.sql,
-- which recreates them and reports whether they landed.

insert into storage.buckets (id, name, public)
values ('deck-previews', 'deck-previews', true)
on conflict (id) do nothing;

-- Access control comes from the bucket, not the caller: Storage's database
-- session does not run as `authenticated`, so a policy with a TO clause never
-- applies to it and auth.uid() has no claims to read. The login gate for
-- creating a share lives on public.shared_decks above, where auth.uid() works.
-- See supabase/fix-storage-policies.sql for the evidence behind this.
update storage.buckets
set file_size_limit    = 5242880,                 -- 5 MB; previews run ~250KB
    allowed_mime_types = array['image/jpeg']
where id = 'deck-previews';

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
