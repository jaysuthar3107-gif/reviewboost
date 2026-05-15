import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: public.ratings
//
//   Columns (match exactly what is in Supabase):
//     id            uuid primary key default gen_random_uuid()
//     business_slug text not null
//     rating        int4
//     rated_at      timestamptz default now()
//
// If you need scan/feedback support later, add columns as needed.
//
// RLS POLICIES (run in Supabase SQL editor if missing):
//   alter table ratings enable row level security;
//
//   -- Allow anyone to insert (public QR page, no login required)
//   create policy "public insert ratings"
//     on ratings for insert with check (true);
//
//   -- Allow authenticated owner to select their own ratings
//   create policy "owner select ratings"
//     on ratings for select
//     using (
//       business_slug in (
//         select slug from businesses where user_id = auth.uid()
//       )
//     );
//
//   -- Enable realtime on ratings table (Supabase Dashboard → Database → Replication)
// ─────────────────────────────────────────────────────────────────────────────

/** Generate AI review suggestions using Gemini API */
export async function generateReviewSuggestions(businessName, rating, lang = 'en') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  const langNames = { en: 'English', gu: 'Gujarati', hi: 'Hindi' }
  const langName = langNames[lang] || 'English'

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return getFallbackSuggestions(businessName, rating, lang)
  }

  try {
    const prompt =
      `Generate 3 short, genuine-sounding Google review suggestions for "${businessName}" ` +
      `with a ${rating}-star rating. Write in ${langName}. Each review should be 1-2 sentences, ` +
      `sound natural and authentic (not marketing-y), and be different from each other.\n` +
      `Return JSON array: ["review1", "review2", "review3"]`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 },
        }),
      }
    )

    if (!res.ok) throw new Error('Gemini API error')
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('Parse error')
  } catch {
    return getFallbackSuggestions(businessName, rating, lang)
  }
}

function getFallbackSuggestions(businessName, rating, lang) {
  const templates = {
    en: {
      5: [
        `Absolutely love ${businessName}! The service was outstanding and I'll definitely be coming back. Highly recommend to everyone!`,
        `${businessName} exceeded all my expectations. The staff was incredibly helpful and the experience was top-notch. Five stars without a doubt!`,
        `Had an amazing experience at ${businessName}. Everything was perfect from start to finish. This is my new go-to place!`,
      ],
      4: [
        `Really enjoyed my visit to ${businessName}. Great service and quality — will definitely return!`,
        `${businessName} is a solid choice. Good experience overall and the staff were very friendly.`,
        `Visited ${businessName} and was very pleased. A few minor things could be improved, but overall great experience!`,
      ],
    },
    gu: {
      5: [
        `${businessName} ખૂબ સરસ છે! સેવા અત્યયુત્તમ હતી, ચોક્કસ ફરી આવીશ. બધાને ભારપૂર્વક ભલામણ!`,
        `${businessName} એ મારી બધી અપેક્ષાઓ વટાવી ગઈ. સ્ટાફ અત્યયુત્તમ હતો. પાંચ તારા!`,
        `${businessName} માં અદ્ભુત અનુભવ. આ મારી પ્રિય જગ્યા બની ગઈ!`,
      ],
      4: [
        `${businessName} ની મુલાકાત ખૂબ ગમી. સારી સેવા, ચોક્કસ ફરી આવીશ!`,
        `${businessName} સારો વિકલ્પ છે. એકંદરે સારો અનુભવ.`,
        `${businessName} ની મુલાકાત ખૂબ સારી હતી. એકંદર સારો અનુભવ!`,
      ],
    },
    hi: {
      5: [
        `${businessName} बहुत शानदार है! सेवा बेहतरीन थी, निश्चित रूप से फिर आऊंगा। सभी को अत्यधिक सिफारिश!`,
        `${businessName} ने मेरी सभी उम्मीदों को पार किया। स्टाफ बहुत मददगार था। पांच सितारे!`,
        `${businessName} में अद्भुत अनुभव हुआ। यह मेरी पसंदीदा जगह बन गई!`,
      ],
      4: [
        `${businessName} की यात्रा बहुत अच्छी रही। अच्छी सेवा, निश्चित रूप से फिर आऊंगा!`,
        `${businessName} एक अच्छा विकल्प है। कुल मिलाकर अच्छा अनुभव।`,
        `${businessName} की यात्रा बहुत अच्छी थी। कुल मिलाकर बढ़िया!`,
      ],
    },
  }

  const langTemplates = templates[lang] || templates.en
  const ratingKey = rating >= 5 ? 5 : 4
  return langTemplates[ratingKey] || langTemplates[5]
}

// ─────────────────────────────────────────────────────────────────────────────
// Review / Rating submission — writes to public.ratings table
//
// Schema: id (uuid), business_slug (text), rating (int4), rated_at (timestamptz)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a QR code scan (no rating yet).
 * Because the ratings table has no "type" column, we skip scan recording
 * or store it as rating=0 — we simply do nothing here to avoid schema errors.
 * Analytics counts scans separately via ReviewPage visits if needed.
 */
export async function recordScan(businessSlug, businessId = null) {
  // ratings table only supports actual star ratings (1–5).
  // Scan tracking would need a separate "scans" table.
  // For now this is a no-op to avoid insert errors.
  console.log('[API] recordScan — skipped (ratings table does not have a type column):', businessSlug)
}

/**
 * Record a star rating into public.ratings table.
 * Only inserts columns that actually exist: business_slug, rating, rated_at
 *
 * @param {string} businessSlug
 * @param {number} selectedRating  — 1 to 5
 * @param {string|null} businessId — unused (not a column), kept for API compat
 */
export async function recordRating(businessSlug, selectedRating, businessId = null) {
  console.log('[API] recordRating START — slug:', businessSlug, '| rating:', selectedRating)

  if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
    console.error('[API] recordRating — invalid rating value:', selectedRating)
    return
  }

  if (!businessSlug) {
    console.error('[API] recordRating — missing businessSlug')
    return
  }

  try {
    const payload = {
      business_slug: businessSlug,
      rating: selectedRating,
      rated_at: new Date().toISOString(),
    }

    console.log('[API] recordRating inserting into ratings:', payload)

    const { data, error } = await supabase
      .from('ratings')
      .insert([payload])
      .select()

    if (error) {
      console.error('[API] recordRating Supabase error:', error.message, '| code:', error.code, '| details:', error.details)
    } else {
      console.log('[API] recordRating SUCCESS — inserted:', data)
    }
  } catch (e) {
    console.error('[API] recordRating threw:', e)
  }
}

/**
 * Record private written feedback.
 * Note: ratings table has no feedback/name columns.
 * This stores only the rating; the text is shown to user but not persisted
 * unless you add a feedback column to the ratings table.
 */
export async function recordFeedback(businessSlug, rating, name, message, businessId = null) {
  console.log('[API] recordFeedback START — slug:', businessSlug, '| rating:', rating, '| name:', name)

  try {
    // Insert the rating portion (columns that exist in schema)
    const payload = {
      business_slug: businessSlug,
      rating,
      rated_at: new Date().toISOString(),
    }

    console.log('[API] recordFeedback inserting into ratings:', payload)

    const { data, error } = await supabase
      .from('ratings')
      .insert([payload])
      .select()

    if (error) {
      console.error('[API] recordFeedback Supabase error:', error.message, error.code)
      throw error
    }

    console.log('[API] recordFeedback SUCCESS — inserted:', data)
    return data
  } catch (e) {
    console.error('[API] recordFeedback threw:', e)
    throw e
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — reads from public.ratings table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all analytics for a business from the ratings table.
 *
 * @param {string} businessSlug
 * @param {string|null} businessId — unused (no business_id column in ratings), kept for API compat
 */
export async function getAnalytics(businessSlug, businessId = null) {
  console.log('[API] getAnalytics START — slug:', businessSlug)

  try {
    const { data: rows, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('business_slug', businessSlug)
      .order('rated_at', { ascending: false })

    console.log('[API] getAnalytics raw rows:', rows?.length ?? 0, '| error:', error)

    if (error) {
      console.error('[API] getAnalytics Supabase error:', error.message, error.code, error.details)
      throw error
    }

    const totalScans   = 0  // not tracked in ratings table
    const totalRatings = rows.length
    const avgRating    = totalRatings > 0
      ? (rows.reduce((s, r) => s + (r.rating || 0), 0) / totalRatings).toFixed(1)
      : 0

    // Star distribution
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    rows.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating] = (dist[r.rating] || 0) + 1
      }
    })

    // Last 30 days daily breakdown — use rated_at column
    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })

    const dailyRatings = days.map(day => ({
      date: day,
      count: rows.filter(r => r.rated_at?.startsWith(day)).length,
      avg: (() => {
        const dayRatings = rows.filter(r => r.rated_at?.startsWith(day) && r.rating)
        return dayRatings.length
          ? (dayRatings.reduce((s, r) => s + r.rating, 0) / dayRatings.length).toFixed(1)
          : null
      })(),
    }))

    // Latest reviews — ratings table has no feedback text, show rating only
    const latestReviews = rows.slice(0, 10).map(r => ({
      id: r.id,
      name: 'Anonymous',
      rating: r.rating,
      feedback: null,
      created_at: r.rated_at,
    }))

    const result = { totalScans, totalRatings, avgRating, dist, dailyRatings, latestReviews }
    console.log('[API] getAnalytics result:', result)
    return result
  } catch (err) {
    console.error('[API] getAnalytics threw:', err)
    return { totalScans: 0, totalRatings: 0, avgRating: 0, dist: {}, dailyRatings: [], latestReviews: [] }
  }
}

/**
 * Subscribe to real-time inserts on the ratings table for a given business.
 * Returns the Supabase channel (call .unsubscribe() to clean up).
 *
 * IMPORTANT: Make sure realtime is enabled for the ratings table in
 * Supabase Dashboard → Database → Replication → ratings (enable INSERT).
 */
export function subscribeToReviews(businessSlug, businessId, onInsert) {
  console.log('[API] subscribeToReviews — slug:', businessSlug)

  const channel = supabase
    .channel(`ratings:${businessSlug}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ratings',
        filter: `business_slug=eq.${businessSlug}`,
      },
      (payload) => {
        console.log('[API] Realtime INSERT received on ratings:', payload.new)
        onInsert(payload.new)
      }
    )
    .subscribe((status) => {
      console.log('[API] Realtime channel status:', status)
    })

  return channel
}
