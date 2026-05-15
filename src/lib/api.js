import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// TABLE SCHEMA (run once in Supabase SQL editor if the table is missing):
//
//   create table if not exists reviews (
//     id            uuid primary key default gen_random_uuid(),
//     business_id   uuid references businesses(id) on delete cascade,
//     business_slug text not null,
//     rating        int  not null check (rating between 1 and 5),
//     name          text,
//     feedback      text,
//     type          text not null default 'rating',  -- 'scan' | 'rating' | 'feedback'
//     created_at    timestamptz not null default now()
//   );
//
//   -- Allow public inserts (QR page is unauthenticated):
//   alter table reviews enable row level security;
//   create policy "public insert" on reviews for insert with check (true);
//   create policy "owner select" on reviews for select using (
//     business_id in (select id from businesses where user_id = auth.uid())
//   );
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
// Review Submission — all events write to the unified `reviews` table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a QR code scan (anonymous, no rating yet).
 * @param {string} businessSlug
 * @param {string|null} businessId  — UUID from businesses table
 */
export async function recordScan(businessSlug, businessId = null) {
  console.log('[API] recordScan START — slug:', businessSlug, '| business_id:', businessId)
  try {
    const payload = {
      business_slug: businessSlug,
      business_id: businessId || null,
      type: 'scan',
      rating: null,
      created_at: new Date().toISOString(),
    }
    console.log('[API] recordScan inserting:', payload)
    const { data, error } = await supabase.from('reviews').insert(payload).select()
    console.log('[API] recordScan result — data:', data, '| error:', error)
    if (error) console.error('[API] recordScan error:', error.message, error.code)
  } catch (e) {
    console.error('[API] recordScan threw:', e)
  }
}

/**
 * Record a star rating (no text feedback).
 * @param {string} businessSlug
 * @param {number} rating
 * @param {string|null} businessId
 */
export async function recordRating(businessSlug, rating, businessId = null) {
  console.log('[API] recordRating START — slug:', businessSlug, '| rating:', rating, '| business_id:', businessId)
  try {
    const payload = {
      business_slug: businessSlug,
      business_id: businessId || null,
      type: 'rating',
      rating,
      created_at: new Date().toISOString(),
    }
    console.log('[API] recordRating inserting:', payload)
    const { data, error } = await supabase.from('reviews').insert(payload).select()
    console.log('[API] recordRating result — data:', data, '| error:', error)
    if (error) console.error('[API] recordRating error:', error.message, error.code)
  } catch (e) {
    console.error('[API] recordRating threw:', e)
  }
}

/**
 * Record private written feedback (low-rating flow).
 * @param {string} businessSlug
 * @param {number} rating
 * @param {string} name
 * @param {string} message
 * @param {string|null} businessId
 */
export async function recordFeedback(businessSlug, rating, name, message, businessId = null) {
  console.log('[API] recordFeedback START — slug:', businessSlug, '| rating:', rating, '| name:', name, '| business_id:', businessId)
  try {
    const payload = {
      business_slug: businessSlug,
      business_id: businessId || null,
      type: 'feedback',
      rating,
      name: name || 'Anonymous',
      feedback: message,
      created_at: new Date().toISOString(),
    }
    console.log('[API] recordFeedback inserting:', payload)
    const { data, error } = await supabase.from('reviews').insert(payload).select()
    console.log('[API] recordFeedback result — data:', data, '| error:', error)
    if (error) {
      console.error('[API] recordFeedback error:', error.message, error.code)
      throw error
    }
    return data
  } catch (e) {
    console.error('[API] recordFeedback threw:', e)
    throw e
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — reads from unified `reviews` table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all analytics for a business.
 * Tries by business_id first (most reliable), falls back to slug.
 */
export async function getAnalytics(businessSlug, businessId = null) {
  console.log('[API] getAnalytics START — slug:', businessSlug, '| business_id:', businessId)

  try {
    // Build query — prefer business_id when available for accuracy
    let query = supabase.from('reviews').select('*')
    if (businessId) {
      console.log('[API] getAnalytics querying by business_id:', businessId)
      query = query.eq('business_id', businessId)
    } else {
      console.log('[API] getAnalytics querying by business_slug:', businessSlug)
      query = query.eq('business_slug', businessSlug)
    }

    const { data: rows, error } = await query.order('created_at', { ascending: false })

    console.log('[API] getAnalytics raw rows:', rows?.length ?? 0, '| error:', error)
    if (error) {
      console.error('[API] getAnalytics Supabase error:', error.message, error.code, error.details)
      throw error
    }

    const scans   = rows.filter(r => r.type === 'scan')
    const ratings = rows.filter(r => r.type === 'rating' || r.type === 'feedback')
    const feedbackRows = rows.filter(r => r.type === 'feedback' && r.feedback)

    const totalScans   = scans.length
    const totalRatings = ratings.length
    const avgRating    = totalRatings > 0
      ? (ratings.reduce((s, r) => s + (r.rating || 0), 0) / totalRatings).toFixed(1)
      : 0

    // Star distribution
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach(r => { if (r.rating) dist[r.rating] = (dist[r.rating] || 0) + 1 })

    // Last 30 days daily breakdown
    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })

    const dailyRatings = days.map(day => ({
      date: day,
      count: ratings.filter(r => r.created_at?.startsWith(day)).length,
      avg: (() => {
        const dayRatings = ratings.filter(r => r.created_at?.startsWith(day) && r.rating)
        return dayRatings.length
          ? (dayRatings.reduce((s, r) => s + r.rating, 0) / dayRatings.length).toFixed(1)
          : null
      })(),
    }))

    // Latest 10 reviews with text feedback
    const latestReviews = feedbackRows.slice(0, 10).map(r => ({
      id: r.id,
      name: r.name || 'Anonymous',
      rating: r.rating,
      feedback: r.feedback,
      created_at: r.created_at,
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
 * Subscribe to real-time inserts on the reviews table for a given business.
 * Returns the Supabase channel (call .unsubscribe() to clean up).
 */
export function subscribeToReviews(businessSlug, businessId, onInsert) {
  console.log('[API] subscribeToReviews — slug:', businessSlug, '| business_id:', businessId)

  const filter = businessId
    ? `business_id=eq.${businessId}`
    : `business_slug=eq.${businessSlug}`

  const channel = supabase
    .channel(`reviews:${businessId || businessSlug}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reviews', filter },
      (payload) => {
        console.log('[API] Real-time INSERT received:', payload.new)
        onInsert(payload.new)
      }
    )
    .subscribe((status) => {
      console.log('[API] Realtime channel status:', status)
    })

  return channel
}
