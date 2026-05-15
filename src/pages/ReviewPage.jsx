import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { generateReviewSuggestions, recordScan, recordRating } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewSuggestions from '../components/ReviewSuggestions'
import PrivateFeedbackForm from '../components/PrivateFeedbackForm'
import { Zap } from 'lucide-react'
import i18n from '../lib/i18n'
import toast from 'react-hot-toast'

const STAR_LABELS = {
  en: { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Excellent! 🎉' },
  gu: { 1: 'ખૂબ ખરાબ', 2: 'ખરાબ', 3: 'ઠીક', 4: 'સારું', 5: 'ઉત્તમ! 🎉' },
  hi: { 1: 'बहुत खराब', 2: 'खराब', 3: 'ठीक', 4: 'अच्छा', 5: 'शानदार! 🎉' },
}

export default function ReviewPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [lang, setLang] = useState(i18n.language || 'en')
  const [animateStar, setAnimateStar] = useState(null)

  const labels = STAR_LABELS[lang] || STAR_LABELS.en

  useEffect(() => {
    async function loadBusiness() {
      console.log('[ReviewPage] loadBusiness START — slug:', slug)
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        console.log('[ReviewPage] businesses query — data:', data, '| error:', error)

        if (error) {
          console.error('[ReviewPage] loadBusiness error:', error.message, error.code)
          setNotFound(true)
          return
        }

        if (!data) {
          console.warn('[ReviewPage] No business found for slug:', slug)
          setNotFound(true)
          return
        }

        setBusiness(data)
        console.log('[ReviewPage] Business loaded:', data.name, '| id:', data.id)

        // Record QR scan into ratings table (type='scan')
        await recordScan(slug)
      } catch (err) {
        console.error('[ReviewPage] loadBusiness threw:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadBusiness()
  }, [slug])

  const handleRating = async (stars) => {
    if (ratingSubmitted) return
    setRating(stars)
    setAnimateStar(stars)
    setTimeout(() => setAnimateStar(null), 400)

    console.log('[ReviewPage] handleRating — stars:', stars)
    await recordRating(slug, stars)
    setRatingSubmitted(true)

    if (stars >= 4) {
      setLoadingSuggestions(true)
      try {
        const s = await generateReviewSuggestions(business?.name || 'this business', stars, lang)
        setSuggestions(s)
      } catch {
        toast.error('Could not load suggestions')
      } finally {
        setLoadingSuggestions(false)
      }
    }
  }

  const changeLang = (code) => {
    setLang(code)
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This review link is invalid or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const displayStar = hovered || rating
  const showHigh = ratingSubmitted && rating >= 4
  const showLow  = ratingSubmitted && rating < 4 && rating > 0

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Language switcher */}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-12">
        <div className="w-full max-w-md">
          {/* Business Card */}
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

          {/* Rating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 mb-4"
          >
            {!ratingSubmitted ? (
              <>
                <p className="text-center text-gray-600 dark:text-gray-300 font-medium mb-6">
                  {t('tapToRate')}
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => handleRating(star)}
                      className="text-5xl transition-all duration-150 hover:scale-125 focus:outline-none active:scale-110"
                      aria-label={`${star} star`}
                    >
                      <span
                        className={`inline-block transition-all duration-200 ${
                          animateStar === star ? 'star-pop' : ''
                        } ${
                          star <= displayStar ? '' : 'opacity-30 grayscale'
                        }`}
                        style={{
                          filter: star <= displayStar ? 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' : 'none',
                          transform: star <= displayStar ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {displayStar > 0 && (
                    <motion.p
                      key={displayStar}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-center font-bold text-lg text-gray-900 dark:text-white"
                    >
                      {labels[displayStar]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-3">{'⭐'.repeat(rating)}</div>
                <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {labels[rating]}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {rating >= 4 ? t('shareOnGoogle') : t('keepPrivate')}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* High rating: AI Suggestions */}
          {showHigh && (
            <ReviewSuggestions
              suggestions={suggestions}
              googleUrl={business?.google_review_url}
              loading={loadingSuggestions}
            />
          )}

          {/* Low rating: Private feedback — pass business_id too */}
          {showLow && (
            <PrivateFeedbackForm
              businessSlug={slug}
              businessId={business?.id}
              rating={rating}
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
