-- ============================================================
-- ReviewBoost — Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. RATINGS TABLE
--    Columns that actually exist: id, business_slug, rating, rated_at
-- ──────────────────────────────────────────────────────────────

-- Enable Row Level Security (safe to run even if already enabled)
alter table public.ratings enable row level security;

-- Drop old policies if they exist (prevents duplicates)
drop policy if exists "public insert ratings" on public.ratings;
drop policy if exists "owner select ratings" on public.ratings;
drop policy if exists "anon insert ratings" on public.ratings;

-- Allow anyone (unauthenticated QR page visitors) to INSERT ratings
create policy "public insert ratings"
  on public.ratings
  for insert
  with check (true);

-- Allow authenticated business owners to SELECT their own ratings
create policy "owner select ratings"
  on public.ratings
  for select
  using (
    business_slug in (
      select slug from public.businesses where user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 2. BUSINESSES TABLE (if it exists — check policies)
-- ──────────────────────────────────────────────────────────────

alter table public.businesses enable row level security;

drop policy if exists "owner select businesses" on public.businesses;
drop policy if exists "owner insert businesses" on public.businesses;
drop policy if exists "owner update businesses" on public.businesses;
drop policy if exists "public read businesses" on public.businesses;

-- Business owners can read their own row
create policy "owner select businesses"
  on public.businesses
  for select
  using (user_id = auth.uid());

-- Authenticated users can insert (for first-time Google OAuth setup)
create policy "owner insert businesses"
  on public.businesses
  for insert
  with check (user_id = auth.uid());

-- Owners can update their own row
create policy "owner update businesses"
  on public.businesses
  for update
  using (user_id = auth.uid());

-- ReviewPage needs to read business by slug (unauthenticated QR scan)
create policy "public read businesses"
  on public.businesses
  for select
  using (true);

-- ──────────────────────────────────────────────────────────────
-- 3. REALTIME — Enable for ratings table
--    Supabase Dashboard → Database → Replication → ratings → enable INSERT
--    OR run this SQL:
-- ──────────────────────────────────────────────────────────────

-- Enable realtime publication for ratings table
alter publication supabase_realtime add table public.ratings;

-- ──────────────────────────────────────────────────────────────
-- 4. VERIFY (optional — run to check)
-- ──────────────────────────────────────────────────────────────

-- Check policies
-- select schemaname, tablename, policyname, cmd, qual
-- from pg_policies
-- where tablename in ('ratings', 'businesses');

-- Check realtime
-- select * from pg_publication_tables where pubname = 'supabase_realtime';
