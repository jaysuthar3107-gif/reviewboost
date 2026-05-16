/**
 * ReviewPage.jsx
 *
 * STRICT FLOW:
 *   page load  → recordScan() only — scans +1, no review record
 *   star click → setSelectedRating() + load AI suggestions (4/5★) — zero DB writes
 *   Submit btn → recordRating() — the ONE place that writes a review to Supabase
 */

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { generateReviewSuggestions, recordScan, recordRating } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewSuggestions from '../components/ReviewSuggestions'
import PrivateFeedbackForm from '../components/PrivateFeedbackForm'
import { Zap, CheckCircle2, ExternalLink } from 'lucide-react'
import i18n from '../lib/i18n'
import toast from 'react-hot-toast'

// ─── Star labels per language ─────────────────────────────────────────────────
const STAR_LABELS = {
  en: { 1: 'Terrible 😞', 2: 'Bad 😕', 3: 'Okay 😐', 4: 'Good 😊', 5: 'Excellent! 🎉' },
  gu: { 1: 'ખૂબ ખરાબ 😞', 2: 'ખરાબ 😕', 3: 'ઠીક 😐', 4: 'સારું 😊', 5: 'ઉત્તમ! 🎉' },
  hi: { 1: 'बहुत खराब 😞', 2: 'खराब 😕', 3: 'ठीक 😐', 4: 'अच्छा 😊', 5: 'शानदार! 🎉' },
}

// ─── Duplicate-submit guard (sessionStorage, 10 min window) ──────────────────
function alreadySubmitted(slug) {
  try {
    const raw = sessionStorage.getItem(`rb_${slug}`)
    if (!raw) return false
    return Date.now() - JSON.parse(raw).ts < 10 * 60 * 1000
  } catch { return false }
}
function markAsSubmitted(slug) {
  try { sessionStorage.setItem(`rb_${slug}`, JSON.stringify({ ts: Date.now() })) } catch {}
}

// ─── Inline spinner ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { slug } = useParams()
  const { t } = useTranslation()

  // ── Page / business ───────────────────────────────────────────────────────
  const [business,   setBusiness]   = useState(null)
  const [pageState,  setPageState]  = useState('loading') // 'loading'|'ready'|'notfound'

  // ── Local UI state — NO DB writes until submit ────────────────────────────
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredStar,    setHoveredStar]    = useState(0)
  const [reviewText,     setReviewText]     = useState('')
  const [animateStar,    setAnimateStar]    = useState(null)

  // ── AI suggestions state ──────────────────────────────────────────────────
  // Loaded on star click (4/5★). No DB write. Pure UI fetch.
  const [suggestions,  setSuggestions]  = useState([])
  const [loadingAI,    setLoadingAI]    = useState(false)
  // Track which star the suggestions were loaded for (avoid redundant fetches)
  const suggestionsForRating = useRef(0)

  // ── Submit lifecycle ──────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted,  setIsSubmitted]  = useState(false)

  // ── Language ──────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || i18n.language || 'en')
  const labels = STAR_LABELS[lang] || STAR_LABELS.en

  // ── Scan guard (prevent double-fire in React StrictMode) ──────────────────
  const scanFiredRef = useRef(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Page open: load business + record scan only
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!slug || scanFiredRef.current) return
    scanFiredRef.current = true

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (error || !data) {
          console.warn('[ReviewPage] not found:', slug, error?.message)
          setPageState('notfound')
          return
        }

        setBusiness(data)
        setPageState('ready')
        console.log('[ReviewPage] loaded:', data.name)

        // ► Only DB write on page load — scan count only
        await recordScan(slug)
        console.log('[ReviewPage] scan recorded')
      } catch (err) {
        console.error('[ReviewPage] load error:', err)
        setPageState('notfound')
      }
    })()
  }, [slug])

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2a — Load AI suggestions for 4/5★ (no DB write — pure UI fetch)
  // ═══════════════════════════════════════════════════════════════════════════
  async function fetchSuggestions(star, businessName, language) {
    // Skip if already loaded for this exact star+lang combo
    if (suggestionsForRating.current === `${star}-${language}`) return

    suggestionsForRating.current = `${star}-${language}`
    setLoadingAI(true)
    setSuggestions([])

    try {
      const ai = await generateReviewSuggestions(businessName, star, language)
      // Validate: must be a non-empty array of strings
      if (Array.isArray(ai) && ai.length > 0) {
        setSuggestions(ai)
        console.log('[ReviewPage] AI suggestions loaded:', ai.length, 'for star:', star)
      } else {
        console.warn('[ReviewPage] AI returned empty suggestions — using fallback')
        setSuggestions([])
      }
    } catch (err) {
      console.warn('[ReviewPage] AI suggestions error (non-fatal):', err)
      setSuggestions([])
    } finally {
      setLoadingAI(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2b — Star click: ONLY local state + trigger AI fetch for 4/5★
  //           Zero database writes here.
  // ═══════════════════════════════════════════════════════════════════════════
  function handleStarClick(star) {
    if (isSubmitted || isSubmitting) return

    // Update local rating state
    setSelectedRating(star)

    // Pop animation
    setAnimateStar(star)
    setTimeout(() => setAnimateStar(null), 380)

    console.log('[ReviewPage] star selected (local only, no DB):', star)

    if (star >= 4) {
      // ► Fetch AI suggestions — NO database write, just UI content
      fetchSuggestions(star, business?.name || 'this business', lang)
    } else {
      // Clear suggestions for low ratings
      setSuggestions([])
      setLoadingAI(false)
      suggestionsForRating.current = 0
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3 — Submit: THE ONLY place that writes a review to Supabase
  // ═══════════════════════════════════════════════════════════════════════════
  async function handleSubmitReview() {
    if (isSubmitting || isSubmitted) return
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      toast.error('Please select a star rating first ⭐')
      return
    }
    if (alreadySubmitted(slug)) {
      toast.error('You already submitted a review — thank you! 🙏')
      setIsSubmitted(true)
      return
    }

    setIsSubmitting(true)
    console.log('[ReviewPage] submitting — rating:', selectedRating, '| text:', reviewText.trim())

    try {
      // ► ONE database insert — review saved here and only here
      await recordRating(slug, selectedRating, reviewText.trim() || null)

      markAsSubmitted(slug)
      setIsSubmitted(true)
      toast.success('Review submitted! Thank you 🙏')
      console.log('[ReviewPage] review submitted successfully ✓')

      // For 4/5★: ensure suggestions are loaded (may already be loaded from star click)
      if (selectedRating >= 4 && suggestions.length === 0 && !loadingAI) {
        await fetchSuggestions(selectedRating, business?.name || 'this business', lang)
      }
    } catch (err) {
      console.error('[ReviewPage] submit failed:', err)
      toast.error('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Suggestion selected → populate textarea (pre-submit convenience) ────────
  function handleSuggestionSelect(text) {
    if (!isSubmitted) {
      setReviewText(text)
      toast.success('Review text filled in — edit it if you like, then submit!')
    }
  }

  // ── Language switcher ──────────────────────────────────────────────────────
  function changeLang(code) {
    setLang(code)
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    // Re-fetch suggestions in new language if rating already selected
    if (selectedRating >= 4) {
      suggestionsForRating.current = 0 // reset cache key so it re-fetches
      fetchSuggestions(selectedRating, business?.name || 'this business', code)
    }
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const displayStar    = hoveredStar || selectedRating
  const showSuggestions = selectedRating >= 4 && (loadingAI || suggestions.length > 0)
  const showLowForm     = isSubmitted && selectedRating >= 1 && selectedRating <= 3

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════════════════════════════════════
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/60 text-sm mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Not found
  // ═══════════════════════════════════════════════════════════════════════════
  if (pageState === 'notfound') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400">This review link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Main review page
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-mesh flex flex-col">

      {/* ── Language switcher ─────────────────────────────────────────────── */}
      <div className="flex justify-end p-4 gap-2">
        {[
          { code: 'en', flag: '🇺🇸', label: 'EN' },
          { code: 'gu', flag: '🇮🇳', label: 'ગુ' },
          { code: 'hi', flag: '🇮🇳', label: 'हि' },
        ].map(l => (
          <button
            key={l.code}
            onClick={() => changeLang(l.code)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              lang === l.code
                ? 'bg-brand-500 text-white shadow-glow-blue'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center p-4 pb-16">
        <div className="w-full max-w-md">

          {/* Business header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
              <span className="text-3xl font-black text-white">
                {business?.name?.[0]?.toUpperCase() || '⭐'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{business?.name}</h1>
            <p className="text-white/60 text-sm mt-1">{t('howWasYourExperience')}</p>
          </motion.div>

          {/* ── Rating card ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 mb-4"
          >
            <AnimatePresence mode="wait">

              {/* ─── SUBMITTED: thank-you screen ─── */}
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-2"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    Thank You! 🙏
                  </h2>
                  <div className="text-4xl mb-2">{'⭐'.repeat(selectedRating)}</div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {labels[selectedRating]}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRating >= 4
                      ? 'Your review has been saved! Help others by sharing it on Google.'
                      : 'Your private feedback helps us improve. Thank you!'}
                  </p>

                  {/* Direct Google button for 4/5★ */}
                  {selectedRating >= 4 && business?.google_review_url && (
                    <motion.a
                      href={business.google_review_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 inline-flex items-center gap-2 btn-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Leave a Google Review
                    </motion.a>
                  )}
                </motion.div>

              ) : (

                /* ─── NOT SUBMITTED: star picker + submit ─── */
                <motion.div key="rating-form">
                  <p className="text-center text-gray-600 dark:text-gray-300 font-medium mb-6">
                    {t('tapToRate')}
                  </p>

                  {/* Stars — click only updates local state, zero DB writes */}
                  <div
                    className="flex justify-center gap-2 mb-4"
                    role="group"
                    aria-label="Star rating selector"
                  >
                    {[1, 2, 3, 4, 5].map(star => {
                      const lit = star <= displayStar
                      return (
                        <button
                          key={star}
                          id={`star-btn-${star}`}
                          type="button"
                          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                          onMouseEnter={() => !isSubmitted && setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => handleStarClick(star)}
                          style={{
                            fontSize: '2.75rem',
                            padding: '4px 8px',
                            background: 'none',
                            border: 'none',
                            cursor: isSubmitted || isSubmitting ? 'default' : 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            lineHeight: 1,
                            userSelect: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              transition: 'transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
                              transform: lit ? 'scale(1.15)' : 'scale(1)',
                              filter: lit
                                ? 'drop-shadow(0 0 10px rgba(251,191,36,0.9))'
                                : 'grayscale(1)',
                              opacity: lit ? 1 : 0.28,
                              animation: animateStar === star ? 'starPop 0.35s ease-out' : 'none',
                            }}
                          >
                            ⭐
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Star label */}
                  <AnimatePresence mode="wait">
                    {displayStar > 0 && (
                      <motion.p
                        key={displayStar}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="text-center font-bold text-lg text-gray-900 dark:text-white mb-4"
                      >
                        {labels[displayStar]}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Review text box — appears after any star selected */}
                  <AnimatePresence>
                    {selectedRating > 0 && (
                      <motion.div
                        key="text-box"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-5"
                      >
                        <label
                          htmlFor="review-text"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {selectedRating >= 4
                            ? '✏️ Add a personal note (optional)'
                            : '✏️ Tell us more (optional)'}
                        </label>
                        <textarea
                          id="review-text"
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          rows={3}
                          className="input-field resize-none text-sm"
                          placeholder={
                            selectedRating >= 4
                              ? 'Share what made your experience great...'
                              : 'Help us understand what went wrong...'
                          }
                        />
                        {selectedRating >= 4 && suggestions.length > 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            💡 Or pick a suggestion below and tap it to auto-fill
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button — ONLY this triggers DB insert */}
                  <AnimatePresence>
                    {selectedRating > 0 && (
                      <motion.div
                        key="submit-area"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <button
                          id="submit-review-btn"
                          type="button"
                          onClick={handleSubmitReview}
                          disabled={isSubmitting}
                          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2 justify-center">
                              <Spinner /> Submitting...
                            </span>
                          ) : (
                            '⭐ Submit Review'
                          )}
                        </button>
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                          You can change your rating before submitting
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          {/* ── AI Suggestions (4/5★) ─────────────────────────────────────────
              Appears immediately on star click (even before submit).
              Pre-submit: clicking a card fills the textarea.
              Post-submit: clicking a card copies text + Google button enabled.
          ─────────────────────────────────────────────────────────────────── */}
          {showSuggestions && (
            <ReviewSuggestions
              key={`suggestions-${selectedRating}-${lang}`}
              suggestions={suggestions}
              loading={loadingAI}
              googleUrl={isSubmitted ? business?.google_review_url : null}
              onSelect={!isSubmitted ? handleSuggestionSelect : null}
              preSubmit={!isSubmitted}
            />
          )}

          {/* ── 1-3★: Private feedback form (shows only after submit) ──────── */}
          {showLowForm && (
            <PrivateFeedbackForm
              businessSlug={slug}
              businessId={business?.id}
              rating={selectedRating}
            />
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 flex items-center justify-center gap-1.5 text-white/30 text-xs">
        <Zap className="w-3 h-3" />
        {t('poweredBy')}
      </div>
    </div>
  )
}
