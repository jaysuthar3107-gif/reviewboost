import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Building2, Link2, Mail, Save, CheckCircle, AlertCircle, Copy, ExternalLink, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Timeout helper ────────────────────────────────────────────────────────────
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s — check your Supabase connection`)), ms)
    ),
  ])
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { business, updateBusiness, refreshBusiness, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: business?.name || '',
    google_review_url: business?.google_review_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Sync form when business loads asynchronously (e.g. after Google OAuth redirect)
  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || '',
        google_review_url: business.google_review_url || '',
      })
    }
  }, [business?.id]) // re-sync only when the business id changes

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const reviewUrl = business?.slug
    ? `${appUrl}/review/${business.slug}`
    : null

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setSaved(false)
    setSaveError(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Business name is required')
      return
    }

    // Capture whether this is a first-time insert BEFORE any async work.
    const isFirstSetup = !business

    console.log('[Settings] handleSave START — isFirstSetup:', isFirstSetup, '| user:', user?.id)
    console.log('[Settings] form values:', form)

    setSaving(true)
    setSaved(false)
    setSaveError(null)

    try {
      if (!isFirstSetup) {
        // ── Existing row: update ────────────────────────────────────────────
        console.log('[Settings] Calling updateBusiness()...')
        const result = await withTimeout(
          updateBusiness({
            name: form.name.trim(),
            google_review_url: form.google_review_url.trim() || null,
          }),
          12_000,
          'updateBusiness'
        )
        console.log('[Settings] updateBusiness() resolved with:', result)
      } else {
        // ── First-time (Google OAuth user): insert then refresh ─────────────
        const slug =
          form.name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

        console.log('[Settings] Inserting new business row — slug:', slug)
        const { data: insertData, error: insertError } = await withTimeout(
          supabase
            .from('businesses')
            .insert({
              user_id: user.id,
              name: form.name.trim(),
              google_review_url: form.google_review_url.trim() || null,
              slug,
            })
            .select()
            .single(),
          12_000,
          'insertBusiness'
        )

        console.log('[Settings] insert result → data:', insertData, '| error:', insertError)
        if (insertError) throw insertError

        // Refresh context so business state is populated
        console.log('[Settings] Calling refreshBusiness()...')
        await withTimeout(refreshBusiness(), 10_000, 'refreshBusiness')
        console.log('[Settings] refreshBusiness() done')
      }

      setSaved(true)
      toast.success(t('profileUpdated') || 'Profile saved!')
      console.log('[Settings] Save SUCCESS — isFirstSetup:', isFirstSetup)

      if (isFirstSetup) {
        console.log('[Settings] Navigating to /dashboard...')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('[Settings] handleSave FAILED:', err.message, err)
      const errorMsg = err.message || t('error') || 'Save failed. Please try again.'
      setSaveError(errorMsg)
      toast.error(errorMsg, { duration: 6000 })
    } finally {
      // Always runs — button can never get stuck in "Saving..."
      setSaving(false)
      console.log('[Settings] handleSave FINALLY — setSaving(false)')
    }
  }

  const copyReviewLink = async () => {
    if (!reviewUrl) return
    await navigator.clipboard.writeText(reviewUrl)
    toast.success('Review link copied!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark page-enter">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {business ? t('businessSettings') : 'Set Up Your Business'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {business
              ? 'Manage your business profile and review settings'
              : 'Fill in your details to get your QR code and start collecting reviews.'}
          </p>

          <div className="space-y-6">
            {/* Business Profile */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500" />
                Business Profile
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('businessName')} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      className="input-field pl-10"
                      placeholder="My Business Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('googleReviewUrl')}
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={form.google_review_url}
                      onChange={e => update('google_review_url', e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://g.page/r/..."
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Find this in Google Business Profile → Get more reviews → Share review form
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field pl-10 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Error banner */}
                {saveError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Save failed</p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{saveError}</p>
                      <p className="text-xs text-red-500 dark:text-red-600 mt-1 opacity-75">
                        Check the browser console (F12) for detailed logs.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : saved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {t('profileUpdated') || 'Saved!'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {business ? t('saveChanges') : 'Create Business Profile'}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Review Link — only show when business exists */}
            {business && reviewUrl && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-brand-500" />
                  Your Review Link
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Share this link with customers or use it as your QR code destination.
                </p>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className="text-sm text-brand-600 dark:text-brand-400 font-mono flex-1 break-all">
                    {reviewUrl}
                  </p>
                  <div className="flex-shrink-0 flex gap-1">
                    <button
                      onClick={copyReviewLink}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <a
                      href={reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      title="Preview"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone — only for existing accounts */}
            {business && (
              <div className="glass-card p-6 border border-red-200 dark:border-red-900/30">
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => toast.error('Please contact support to delete your account')}
                  className="btn-danger !py-2 !px-4 text-sm"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
