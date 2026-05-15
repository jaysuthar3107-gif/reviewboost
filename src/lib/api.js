import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: public.ratings  (after running supabase_fix.sql)
//
//   id            uuid        PK, default gen_random_uuid()
//   business_slug text        NOT NULL
//   rating        int4        NULL for scan rows, 1–5 for rating/feedback rows
//   rated_at      timestamptz default now()
//   name          text        NULL — reviewer name (optional)
//   feedback      text        NULL — written message (low-rating flow)
//   type          text        NOT NULL default 'rating' — 'scan'|'rating'|'feedback'
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AI Review Suggestions
// ─────────────────────────────────────────────────────────────────────────────

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
// Shared insert helper
// ─────────────────────────────────────────────────────────────────────────────
async function insertRow(payload, label) {
  console.log(`[API] ${label} inserting:`, payload)
  const { data, error } = await supabase.from('ratings').insert([payload]).select()
  if (error) {
    console.error(`[API] ${label} Supabase error:`, error.message, '| code:', error.code, '| details:', error.details)
    throw error
  }
  console.log(`[API] ${label} SUCCESS:`, data)
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// recordScan — inserts a 'scan' row when the QR/review page loads
// ─────────────────────────────────────────────────────────────────────────────
export async function recordScan(businessSlug) {
  if (!businessSlug) return
  console.log('[API] recordScan — slug:', businessSlug)
  try {
    await insertRow(
      {
        business_slug: businessSlug,
        type: 'scan',
        rating: null,
        rated_at: new Date().toISOString(),
      },
      'recordScan'
    )
  } catch (e) {
    // Non-fatal — never break the review page over a scan insert failure
    console.error('[API] recordScan non-fatal error:', e.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordRating — inserts a star rating (no text feedback)
// ─────────────────────────────────────────────────────────────────────────────
export async function recordRating(businessSlug, selectedRating) {
  console.log('[API] recordRating — slug:', businessSlug, '| rating:', selectedRating)

  if (!businessSlug) {
    console.error('[API] recordRating — missing businessSlug')
    return
  }
  if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
    console.error('[API] recordRating — invalid rating:', selectedRating)
    return
  }

  try {
    await insertRow(
      {
        business_slug: businessSlug,
        type: 'rating',
        rating: selectedRating,
        rated_at: new Date().toISOString(),
      },
      'recordRating'
    )
  } catch (e) {
    console.error('[API] recordRating error:', e.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordFeedback — inserts rating + name + written feedback (low-rating flow)
// ─────────────────────────────────────────────────────────────────────────────
export async function recordFeedback(businessSlug, rating, name, message) {
  console.log('[API] recordFeedback — slug:', businessSlug, '| rating:', rating, '| name:', name)

  if (!businessSlug) throw new Error('Missing businessSlug')
  if (!rating || rating < 1 || rating > 5) throw new Error('Invalid rating: ' + rating)
  if (!message?.trim()) throw new Error('Feedback message is required')

  return insertRow(
    {
      business_slug: businessSlug,
      type: 'feedback',
      rating,
      name: name?.trim() || null,         // null = Anonymous; shown as "Anonymous" in dashboard
      feedback: message.trim(),
      rated_at: new Date().toISOString(),
    },
    'recordFeedback'
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// getAnalytics — fetches all rows and computes dashboard stats
// ─────────────────────────────────────────────────────────────────────────────
export async function getAnalytics(businessSlug) {
  console.log('[API] getAnalytics — slug:', businessSlug)

  if (!businessSlug) {
    return { totalScans: 0, totalRatings: 0, avgRating: 0, dist: {}, dailyRatings: [], latestReviews: [] }
  }

  try {
    const { data: rows, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('business_slug', businessSlug)
      .order('rated_at', { ascending: false })

    console.log('[API] getAnalytics raw rows:', rows?.length ?? 0, '| error:', error)

    if (error) {
      console.error('[API] getAnalytics error:', error.message, error.code, error.details)
      throw error
    }

    // Partition by type
    const scanRows     = rows.filter(r => r.type === 'scan')
    const ratingRows   = rows.filter(r => r.type === 'rating' || r.type === 'feedback')
    const feedbackRows = rows.filter(r => r.type === 'feedback' && r.feedback?.trim())

    const totalScans   = scanRows.length
    const totalRatings = ratingRows.length
    const avgRating    = totalRatings > 0
      ? (ratingRows.reduce((s, r) => s + (r.rating || 0), 0) / totalRatings).toFixed(1)
      : 0

    // Star distribution (1–5)
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingRows.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++
    })

    // Positive rate (4–5 stars)
    const positiveCount = (dist[4] || 0) + (dist[5] || 0)
    const positiveRate = totalRatings > 0
      ? Math.round((positiveCount / totalRatings) * 100)
      : 0

    // Last 30 days daily breakdown
    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })

    const dailyRatings = days.map(day => {
      const dayRows = ratingRows.filter(r => r.rated_at?.startsWith(day))
      return {
        date: day,
        count: dayRows.length,
        avg: dayRows.length
          ? (dayRows.reduce((s, r) => s + r.rating, 0) / dayRows.length).toFixed(1)
          : null,
      }
    })

    // Latest 10 feedback rows (those with text) — with name + stars
    const latestReviews = feedbackRows.slice(0, 10).map(r => ({
      id: r.id,
      name: r.name?.trim() || null,   // null → dashboard shows "Anonymous"
      rating: r.rating,
      feedback: r.feedback,
      created_at: r.rated_at,
    }))

    const result = { totalScans, totalRatings, avgRating, dist, positiveRate, dailyRatings, latestReviews }
    console.log('[API] getAnalytics result:', result)
    return result
  } catch (err) {
    console.error('[API] getAnalytics threw:', err)
    return { totalScans: 0, totalRatings: 0, avgRating: 0, dist: {}, positiveRate: 0, dailyRatings: [], latestReviews: [] }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// subscribeToReviews — Supabase Realtime for dashboard live updates
//
// Requires: Supabase Dashboard → Database → Replication → ratings → INSERT enabled
// Or run: ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
// ─────────────────────────────────────────────────────────────────────────────
export function subscribeToReviews(businessSlug, onInsert) {
  console.log('[API] subscribeToReviews — slug:', businessSlug)

  const channel = supabase
    .channel(`ratings-${businessSlug}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ratings',
        filter: `business_slug=eq.${businessSlug}`,
      },
      (payload) => {
        console.log('[API] Realtime INSERT on ratings:', payload.new)
        onInsert(payload.new)
      }
    )
    .subscribe((status) => {
      console.log('[API] Realtime channel status:', status)
    })

  return channel
}
