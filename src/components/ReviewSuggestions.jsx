import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, ExternalLink, Check, Sparkles, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ReviewSuggestions({ suggestions, googleUrl, loading }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = suggestions[selected]
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  const handleCopyAndOpen = async () => {
    await handleCopy()
    if (googleUrl) {
      setTimeout(() => window.open(googleUrl, '_blank'), 300)
    }
  }

  if (loading) {
    return (
      <div className="mt-8 glass-card p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
            <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Generating AI suggestions...</p>
        </div>
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-200/50 dark:border-brand-700/30 mb-3">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{t('reviewSuggestions')}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('suggestionSubtitle')}</p>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 text-sm leading-relaxed ${
                selected === i
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 shadow-glow-blue'
                  : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-white/5 hover:border-brand-300 dark:hover:border-brand-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === i ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selected === i && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{s}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopy}
            className={`btn-secondary flex-1 gap-2 ${copied ? '!text-emerald-600 !border-emerald-300 dark:!border-emerald-700' : ''}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied') : t('copyReview')}
          </button>

          {googleUrl && (
            <button
              onClick={handleCopyAndOpen}
              className="btn-primary flex-1 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t('copyAndOpen')}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
