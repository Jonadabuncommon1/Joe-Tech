-- Run this once in Supabase's SQL Editor (Joe Tech project).
-- Creates the table api/track-visit.ts logs every site visit into.

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ip text,
  country text,
  region text,
  city text,
  path text,
  referrer text,
  user_agent text,
  device text,
  browser text
);

alter table public.site_visits enable row level security;

-- The logger uses the same public anon key the site already ships, so this
-- policy is the real security boundary: anon can add rows, never read them
-- back. You can still see everything yourself in the Table Editor, that
-- uses your own Supabase login, not the anon key, so this policy doesn't
-- apply to you there.
create policy "Allow anonymous inserts" on public.site_visits
  for insert
  to anon
  with check (true);
