/**
 * ReviewSuggestions.jsx
 *
 * Props:
 *   suggestions  string[]        — AI-generated review texts
 *   loading      boolean         — show spinner while fetching
 *   googleUrl    string|null     — Google review URL (null = hide Google button)
 *   onSelect     function|null   — called with suggestion text when card clicked (pre-submit)
 *   preSubmit    boolean         — true = "Use this" mode; false = "Copy" mode
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, ExternalLink, Check, Sparkles, Loader, PenSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ReviewSuggestions({
  suggestions = [],
  loading = false,
  googleUrl = null,
  onSelect = null,
  preSubmit = false,
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(0)
  const [copied,   setCopied]   = useState(false)

  // ── Copy selected suggestion to clipboard ────────────────────────────────
  async function handleCopy() {
    const text = suggestions[selected]
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('copied') || 'Copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard API
      try {
        const el = document.createElement('textarea')
        el.value = text
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setCopied(true)
        toast.success(t('copied') || 'Copied!')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Copy failed — please copy manually')
      }
    }
  }

  // ── Copy + open Google ───────────────────────────────────────────────────
  async function handleCopyAndOpen() {
    await handleCopy()
    if (googleUrl) {
      setTimeout(() => window.open(googleUrl, '_blank', 'noopener,noreferrer'), 350)
    }
  }

  // ── Card click — fills textarea pre-submit OR selects for copy post-submit
  function handleCardClick(index) {
    setSelected(index)
    if (preSubmit && onSelect) {
      onSelect(suggestions[index])
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 glass-card p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
            <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Generating AI suggestions...
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Crafting review ideas just for you
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Nothing to show ──────────────────────────────────────────────────────
  if (!suggestions || suggestions.length === 0) return null

  // ── Suggestions card ─────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        key="suggestions-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mt-6 space-y-4"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-200/50 dark:border-brand-700/30 mb-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {t('reviewSuggestions') || 'AI Review Suggestions'}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {preSubmit
              ? 'Tap a suggestion to auto-fill your review text, then submit'
              : (t('suggestionSubtitle') || 'Select one to copy and share on Google')}
          </p>
        </div>

        {/* Suggestion cards */}
        <div className="space-y-3">
          {suggestions.map((text, i) => {
            const isActive = selected === i
            return (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                onClick={() => handleCardClick(i)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 text-sm leading-relaxed ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-900/25 shadow-glow-blue'
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-white/5 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Text */}
                  <p className="text-gray-700 dark:text-gray-300 flex-1">{text}</p>

                  {/* Pre-submit: show "use this" icon on active */}
                  {preSubmit && isActive && (
                    <PenSquare className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Pre-submit hint on active card */}
                {preSubmit && isActive && (
                  <p className="text-xs text-brand-500 dark:text-brand-400 mt-2 ml-8">
                    ✓ Auto-filled in your review text above
                  </p>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className={`btn-secondary flex-1 gap-2 ${
              copied ? '!text-emerald-600 !border-emerald-400 dark:!border-emerald-600' : ''
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (t('copied') || 'Copied!') : (t('copyReview') || 'Copy Review')}
          </button>

          {googleUrl && (
            <button
              type="button"
              onClick={handleCopyAndOpen}
              className="btn-primary flex-1 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t('copyAndOpen') || 'Copy & Open Google'}
            </button>
          )}
        </div>

        {/* Pre-submit reminder */}
        {preSubmit && (
          <p className="text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2">
            📝 Remember to click <strong>Submit Review</strong> above to save your rating
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
