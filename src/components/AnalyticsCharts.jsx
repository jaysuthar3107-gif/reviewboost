import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts'
import { TrendingUp, BarChart2 } from 'lucide-react'

const COLORS = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#0ea5e9',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm shadow-card-hover">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsCharts({ analytics }) {
  const { t } = useTranslation()

  const distData = Object.entries(analytics.dist || {}).map(([star, count]) => ({
    star: `${star}★`,
    count,
    fill: COLORS[star],
  }))

  const trendData = (analytics.dailyRatings || [])
    .filter(d => d.count > 0)
    .slice(-14)
    .map(d => ({
      date: d.date.slice(5), // MM-DD
      Ratings: d.count,
      Avg: parseFloat(d.avg || 0),
    }))

  if (!analytics.totalRatings) {
    return (
      <div className="glass-card p-10 text-center col-span-2">
        <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noDataYet')}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('startGettingReviews')}</p>
      </div>
    )
  }

  return (
    <>
      {/* Ratings Over Time */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('ratingsOverTime')}</h3>
          <span className="badge-blue ml-auto">{t('last30Days')}</span>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="Ratings" stroke="#0ea5e9" fill="url(#colorRatings)" strokeWidth={2} />
              <Area type="monotone" dataKey="Avg" stroke="#8b5cf6" fill="url(#colorAvg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">{t('noDataYet')}</div>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-accent-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('ratingDistribution')}</h3>
        </div>
        {distData.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="star" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">{t('noDataYet')}</div>
        )}
      </div>
    </>
  )
}
