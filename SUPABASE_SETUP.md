# ReviewBoost — Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 2. Run SQL Migrations

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses table
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  google_review_url text,
  created_at timestamptz default now()
);

-- Scans table (QR code scans)
create table if not exists scans (
  id uuid primary key default uuid_generate_v4(),
  business_slug text references businesses(slug) on delete cascade,
  scanned_at timestamptz default now()
);

-- Ratings table
create table if not exists ratings (
  id uuid primary key default uuid_generate_v4(),
  business_slug text references businesses(slug) on delete cascade,
  rating integer check (rating between 1 and 5),
  rated_at timestamptz default now()
);

-- Feedback table (private, for ratings < 4)
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  business_slug text references businesses(slug) on delete cascade,
  rating integer,
  name text,
  message text,
  submitted_at timestamptz default now()
);

-- Row Level Security
alter table businesses enable row level security;
alter table scans enable row level security;
alter table ratings enable row level security;
alter table feedback enable row level security;

-- Policies: businesses (owner only)
create policy "Users can read their own business"
  on businesses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own business"
  on businesses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own business"
  on businesses for update
  using (auth.uid() = user_id);

-- Policies: public can read business by slug (for review page)
create policy "Public can view businesses by slug"
  on businesses for select
  using (true);

-- Policies: anyone can insert scans/ratings/feedback (customers)
create policy "Anyone can insert scans"
  on scans for insert
  with check (true);

create policy "Anyone can insert ratings"
  on ratings for insert
  with check (true);

create policy "Anyone can insert feedback"
  on feedback for insert
  with check (true);

-- Business owners can view their analytics
create policy "Owners can view their scans"
  on scans for select
  using (
    business_slug in (
      select slug from businesses where user_id = auth.uid()
    )
  );

create policy "Owners can view their ratings"
  on ratings for select
  using (
    business_slug in (
      select slug from businesses where user_id = auth.uid()
    )
  );

create policy "Owners can view their feedback"
  on feedback for select
  using (
    business_slug in (
      select slug from businesses where user_id = auth.uid()
    )
  );
```

---

## 3. Configure Authentication

In Supabase Dashboard → Authentication → Settings:
- Enable **Email** provider
- Set **Site URL** to your app URL (e.g., `http://localhost:5173`)
- Add redirect URLs if needed

---

## 4. Optional: Gemini AI Review Suggestions

To enable AI-generated review suggestions:
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com)
2. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

Without this, the app uses built-in review templates (English, Gujarati, Hindi).

---

## 5. App URLs

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` | Business signup |
| `/login` | Business login |
| `/dashboard` | Analytics + QR code |
| `/settings` | Business settings |
| `/review/:slug` | Customer review page |

The customer review URL is automatically generated as:
`https://your-app.com/review/your-business-name-1234567890`

---

## 6. Demo Mode

The app works **without Supabase** in demo mode:
- Visit `/dashboard` after clicking "Try Demo Dashboard" on login
- Sample analytics data is shown
- Review page works at `/review/demo-business`
- AI suggestions use built-in templates
