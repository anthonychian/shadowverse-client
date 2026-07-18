-- Cloud deck storage for Discord login (run once in the Supabase SQL Editor).
-- One row per user; the whole deck list lives in `decks` as jsonb, in exactly
-- the same shape as the redux-persist local list:
--   [{ name, class, deck: [names], evoDeck: [names], art: {name: cardNo} }]
-- RLS restricts every operation to the row owner; the client talks to this
-- table directly with the publishable key (see src/lib/supabase.js).

create table public.user_decks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  decks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_decks enable row level security;

create policy "Users read own decks"
  on public.user_decks for select
  using ((select auth.uid()) = user_id);

create policy "Users insert own decks"
  on public.user_decks for insert
  with check ((select auth.uid()) = user_id);

create policy "Users update own decks"
  on public.user_decks for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own decks"
  on public.user_decks for delete
  using ((select auth.uid()) = user_id);
