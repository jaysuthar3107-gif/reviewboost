-- ============================================================
-- ReviewBoost — ALTER ratings table to add missing columns
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Add columns that do not yet exist in public.ratings
-- (ALTER COLUMN is safe to run even if the column already exists on PG 12+)
-- We use DO blocks to avoid errors if columns already exist.

DO $$
BEGIN
  -- reviewer name (optional, shown in dashboard)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ratings' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.ratings ADD COLUMN name text;
  END IF;

  -- written feedback text (optional, low-rating flow)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ratings' AND column_name = 'feedback'
  ) THEN
    ALTER TABLE public.ratings ADD COLUMN feedback text;
  END IF;

  -- row type: 'scan' | 'rating' | 'feedback'
  -- Scans have rating = NULL, ratings/feedback have rating 1-5
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ratings' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.ratings ADD COLUMN type text NOT NULL DEFAULT 'rating';
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- RLS policies
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop stale policies (safe to re-run)
DROP POLICY IF EXISTS "public insert ratings" ON public.ratings;
DROP POLICY IF EXISTS "owner select ratings" ON public.ratings;
DROP POLICY IF EXISTS "anon insert ratings" ON public.ratings;

-- Anyone (unauthenticated QR visitor) may insert
CREATE POLICY "public insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (true);

-- Authenticated owner may select rows belonging to their business
CREATE POLICY "owner select ratings"
  ON public.ratings FOR SELECT
  USING (
    business_slug IN (
      SELECT slug FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- Businesses table policies (safe to re-run)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read businesses"  ON public.businesses;
DROP POLICY IF EXISTS "owner select businesses" ON public.businesses;
DROP POLICY IF EXISTS "owner insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "owner update businesses" ON public.businesses;

-- ReviewPage reads by slug — unauthenticated
CREATE POLICY "public read businesses"
  ON public.businesses FOR SELECT USING (true);

-- Owner CRUD
CREATE POLICY "owner insert businesses"
  ON public.businesses FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner update businesses"
  ON public.businesses FOR UPDATE USING (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- Realtime — enable for ratings table
-- ──────────────────────────────────────────────────────────────

-- If this errors with "already member", that's fine — table is already enabled.
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;

-- ──────────────────────────────────────────────────────────────
-- Verify (optional)
-- ──────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'ratings'
-- ORDER BY ordinal_position;
