import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { recordFeedback } from '../lib/api'
import toast from 'react-hot-toast'

export default function PrivateFeedbackForm({ businessSlug, businessId, rating }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    console.log('[FeedbackForm] handleSubmit — slug:', businessSlug, '| businessId:', businessId, '| rating:', rating)
    setSubmitting(true)
    setSubmitError(null)

    try {
      // Pass business_id so the dashboard can query by id
      await recordFeedback(businessSlug, rating, name, message, businessId)
      setSubmitted(true)
      toast.success(t('feedbackSent') || 'Feedback sent — thank you!')
    } catch (err) {
      console.error('[FeedbackForm] submit failed:', err)
      const msg = err.message || t('error') || 'Something went wrong. Please try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-8 glass-card p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('feedbackThankYou')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{t('feedbackReceived')}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('keepPrivate')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('feedbackLabel')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('yourName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder={t('yourName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('yourFeedback')} *
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={4}
            className="input-field resize-none"
            placeholder={t('yourFeedback')}
          />
        </div>

        {/* Error message */}
        {submitError && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('loading')}
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('sendFeedback')}
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
