-- ============================================================
-- ReviewBoost: Unified Reviews Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the reviews table
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references public.businesses(id) on delete cascade,
  business_slug text not null,
  type          text not null default 'rating'   -- 'scan' | 'rating' | 'feedback'
                check (type in ('scan', 'rating', 'feedback')),
  rating        int  check (rating between 1 and 5),  -- null for scans
  name          text,
  feedback      text,
  created_at    timestamptz not null default now()
);

-- 2. Index for fast per-business queries
create index if not exists reviews_business_id_idx   on public.reviews (business_id);
create index if not exists reviews_business_slug_idx on public.reviews (business_slug);
create index if not exists reviews_created_at_idx    on public.reviews (created_at desc);

-- 3. Enable Row Level Security
alter table public.reviews enable row level security;

-- 4. Allow anyone (unauthenticated QR page) to INSERT
drop policy if exists "public insert reviews" on public.reviews;
create policy "public insert reviews"
  on public.reviews
  for insert
  with check (true);

-- 5. Allow authenticated business owners to SELECT their own reviews
drop policy if exists "owner select reviews" on public.reviews;
create policy "owner select reviews"
  on public.reviews
  for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

-- 6. Enable Realtime for live dashboard updates
-- (Run this separately if needed)
-- alter publication supabase_realtime add table public.reviews;

-- ============================================================
-- Verify the table was created:
-- select * from public.reviews limit 5;
-- ============================================================
