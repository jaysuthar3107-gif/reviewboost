import { useEffect, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { getAnalytics, subscribeToReviews } from '../lib/api'
import { motion } from 'framer-motion'
import {
  QrCode, Star, TrendingUp, Activity, ExternalLink,
  Settings, ArrowUpRight, Clock, AlertCircle, RefreshCw,
  MessageSquare, Zap,
} from 'lucide-react'
import QRCodeCard from '../components/QRCodeCard'
import AnalyticsCharts from '../components/AnalyticsCharts'

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
    </motion.div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

// ─── "No business profile yet" ────────────────────────────────────────────────
function NoBusiness({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark flex items-center justify-center p-6">
      <div className="glass-card p-10 max-w-md text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Complete your profile
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You're signed in but haven't set up your business yet. Fill in your details to get your
          QR code and start collecting reviews.
        </p>
        <button onClick={() => navigate('/settings')} className="btn-primary w-full">
          Set Up Business Profile
        </button>
      </div>
    </div>
  )
}

// ─── Latest Reviews ───────────────────────────────────────────────────────────
function LatestReviews({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No feedback yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Share your QR code to start collecting reviews
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-brand-500" />
        Latest Feedback
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {reviews.map(r => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {r.name || 'Anonymous'}
              </span>
              <span className="text-xs text-yellow-500 ml-2 flex-shrink-0">
                {'⭐'.repeat(r.rating)}
              </span>
            </div>
            {r.feedback && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{r.feedback}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation()
  const { business, user } = useAuth()
  const navigate = useNavigate()

  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const reviewUrl = business ? `${appUrl}/review/${business.slug}` : ''

  // ── Fetch analytics ────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    if (!business?.slug) return

    console.log('[Dashboard] fetchAnalytics — slug:', business.slug, '| id:', business.id)
    setLoadingAnalytics(true)
    setAnalyticsError(false)

    try {
      const data = await getAnalytics(business.slug)
      console.log('[Dashboard] analytics loaded:', data)
      setAnalytics(data)
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('[Dashboard] fetchAnalytics error:', err)
      setAnalyticsError(true)
    } finally {
      setLoadingAnalytics(false)
    }
  }, [business?.slug])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // ── Realtime subscription — re-fetch on every new review insert ────────────
  useEffect(() => {
    if (!business?.slug) return

    console.log('[Dashboard] subscribing to realtime — slug:', business.slug)
    const channel = subscribeToReviews(business.slug, (newRow) => {
      console.log('[Dashboard] realtime: new row received, refreshing…', newRow)
      fetchAnalytics()
    })

    return () => {
      console.log('[Dashboard] unsubscribing realtime channel')
      channel.unsubscribe()
    }
  }, [business?.slug, fetchAnalytics])

  // ── No business yet ────────────────────────────────────────────────────────
  if (!business) {
    return <NoBusiness navigate={navigate} />
  }

  // ── Stats derived from analytics ───────────────────────────────────────────
  const stats = analytics
    ? [
        {
          icon: QrCode,
          label: t('totalScans'),
          value: analytics.totalScans.toLocaleString(),
          color: 'bg-gradient-to-br from-brand-500 to-brand-600',
          trend: null,
        },
        {
          icon: Star,
          label: t('totalRatings'),
          value: analytics.totalRatings.toLocaleString(),
          color: 'bg-gradient-to-br from-gold-400 to-gold-500',
          trend: null,
        },
        {
          icon: TrendingUp,
          label: t('averageRating'),
          value: analytics.totalRatings > 0 ? `${analytics.avgRating}★` : '—',
          color: 'bg-gradient-to-br from-accent-500 to-accent-600',
          trend: null,
        },
        {
          icon: Activity,
          label: 'Positive Rate',
          value: analytics.totalRatings > 0 ? `${analytics.positiveRate}%` : '—',
          color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
          trend: null,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
              {business.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4" />
              Dashboard · {user?.email}
            </p>
            {lastRefreshed && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchAnalytics}
              disabled={loadingAnalytics}
              className="btn-secondary !py-2 !px-4 text-sm gap-1.5 disabled:opacity-50"
              title="Refresh analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {business.google_review_url && (
              <a
                href={business.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !py-2 !px-4 text-sm gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Profile
              </a>
            )}
            <Link to="/settings" className="btn-secondary !py-2 !px-4 text-sm gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              {t('settings')}
            </Link>
          </div>
        </div>

        {/* ── Realtime indicator ── */}
        <div className="flex items-center gap-2 mb-4 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live updates enabled — dashboard refreshes automatically when new reviews come in
        </div>

        {/* ── Analytics error ── */}
        {analyticsError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Could not load analytics
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Check your Supabase <code>ratings</code> table and RLS policies. See console for details.
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loadingAnalytics
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Main content ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Charts + Latest Reviews */}
          <div className="lg:col-span-2 grid gap-6">
            {loadingAnalytics ? (
              <div className="glass-card p-8 animate-pulse">
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              </div>
            ) : (
              analytics && <AnalyticsCharts analytics={analytics} />
            )}

            {/* Latest feedback reviews */}
            {!loadingAnalytics && (
              <LatestReviews reviews={analytics?.latestReviews || []} />
            )}
          </div>

          {/* QR Code + Rating Breakdown */}
          <div className="space-y-6">
            <QRCodeCard url={reviewUrl} businessName={business.name} />

            {analytics && analytics.totalRatings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" />
                  Rating Breakdown
                </h3>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = analytics.dist[star] || 0
                  const pct =
                    analytics.totalRatings > 0
                      ? (count / analytics.totalRatings) * 100
                      : 0
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2.5">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-3">
                        {star}
                      </span>
                      <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + star * 0.05, duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
