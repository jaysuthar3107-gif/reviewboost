import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Eye, LogIn, Star, QrCode, Cookie, Lock, Globe,
  UserCheck, Clock, MessageCircle, ChevronRight, Zap,
} from 'lucide-react'

const CONTACT_WHATSAPP = 'https://wa.me/918154887982'
const CONTACT_PHONE    = '+91 81548 87982'
const EFFECTIVE_DATE   = 'May 15, 2025'
const COMPANY_NAME     = 'ReviewBoost'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

// Gradient accent bar behind section headings
function SectionBadge({ icon: Icon, label, color }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

const sections = [
  {
    id: 'introduction',
    icon: Zap,
    badge: { label: 'Overview', color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' },
    title: '1. Introduction',
    content: [
      `Welcome to ${COMPANY_NAME}. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our platform.`,
      `By using ${COMPANY_NAME}, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of our services.`,
    ],
  },
  {
    id: 'information',
    icon: Eye,
    badge: { label: 'Data Collection', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    title: '2. Information We Collect',
    items: [
      { label: 'Account Information', desc: 'Email address, business name, and authentication credentials when you sign up.' },
      { label: 'Business Profile Data', desc: 'Business name, Google Review URL, and custom QR code slug.' },
      { label: 'Review & Rating Data', desc: 'Star ratings, written feedback, reviewer names submitted through your QR code page.' },
      { label: 'Usage Analytics', desc: 'QR code scan counts, rating timestamps, and interaction patterns — used only to power your dashboard.' },
      { label: 'Device & Browser Info', desc: 'IP address, browser type, and device type for security and performance purposes.' },
    ],
  },
  {
    id: 'account',
    icon: LogIn,
    badge: { label: 'Authentication', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    title: '3. Account & Login Data',
    content: [
      `We use Supabase for authentication. You may sign up using your email/password or via Google OAuth. When you sign in with Google, we receive your email address and profile name as provided by Google.`,
      `We do not store your Google or social login passwords. Session tokens are managed securely by Supabase and stored in your browser's local storage for session persistence.`,
    ],
  },
  {
    id: 'google',
    icon: Star,
    badge: { label: 'Google Reviews', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    title: '4. Google Review Links',
    content: [
      `You may optionally provide your Google Business review link in your account settings. This link is used to redirect high-rating customers (4–5 stars) to leave a public Google review.`,
      `${COMPANY_NAME} does not control, modify, or interact with your Google Business Profile. We only store the URL you provide and display it as a redirect for customers.`,
    ],
  },
  {
    id: 'qr',
    icon: QrCode,
    badge: { label: 'QR Code', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    title: '5. QR Code Usage',
    content: [
      `Each business on ${COMPANY_NAME} receives a unique QR code linked to a public review page. When a customer scans your QR code, we record a scan event (timestamp + business ID) anonymously — no personal data is collected from the scanner.`,
      `If a customer leaves a rating or written feedback, that data is stored in our database and visible only to you in your dashboard.`,
    ],
  },
  {
    id: 'cookies',
    icon: Cookie,
    badge: { label: 'Cookies', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    title: '6. Cookies & Analytics',
    items: [
      { label: 'Session Cookies', desc: 'Required for maintaining your login session. Removed on logout.' },
      { label: 'Preference Storage', desc: 'Language preference and dark/light theme stored in localStorage.' },
      { label: 'No Ad Tracking', desc: 'We do not use advertising cookies or share data with ad networks.' },
      { label: 'No Third-Party Analytics', desc: 'We do not currently use Google Analytics or similar tools on the main app.' },
    ],
  },
  {
    id: 'security',
    icon: Lock,
    badge: { label: 'Security', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    title: '7. Data Protection & Security',
    content: [
      `All data is stored on Supabase infrastructure with industry-standard encryption at rest and in transit (TLS/HTTPS). Row-Level Security (RLS) policies ensure you can only access your own business data.`,
      `We take security seriously but cannot guarantee 100% security. In the event of a data breach affecting your personal information, we will notify you within 72 hours as required by applicable law.`,
    ],
  },
  {
    id: 'third-party',
    icon: Globe,
    badge: { label: 'Third Parties', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    title: '8. Third-Party Services',
    items: [
      { label: 'Supabase', desc: 'Database and authentication provider. Data is stored in Supabase-hosted PostgreSQL.' },
      { label: 'Google OAuth', desc: 'Optional login provider. Governed by Google\'s Privacy Policy.' },
      { label: 'Google Gemini AI', desc: 'Used optionally to generate review suggestion text. Only business name and rating are sent — no personal data.' },
      { label: 'Vercel / Hosting', desc: 'Our frontend may be hosted on Vercel or similar platforms which may collect standard server logs.' },
    ],
  },
  {
    id: 'rights',
    icon: UserCheck,
    badge: { label: 'Your Rights', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    title: '9. User Rights',
    items: [
      { label: 'Access', desc: 'You may request a copy of your personal data at any time.' },
      { label: 'Correction', desc: 'You may update your business name, email, and review URL through Settings.' },
      { label: 'Deletion', desc: 'You may request account deletion by contacting us via WhatsApp. We will delete all associated data within 30 days.' },
      { label: 'Portability', desc: 'You may request an export of your review and analytics data.' },
      { label: 'Opt-out', desc: 'You may stop using the service at any time. Your data will be retained per our retention policy unless deletion is requested.' },
    ],
  },
  {
    id: 'retention',
    icon: Clock,
    badge: { label: 'Retention', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400' },
    title: '10. Data Retention',
    content: [
      `Active account data is retained as long as your account exists. Review data, scan data, and feedback submitted by customers is retained indefinitely to power your dashboard analytics unless you request deletion.`,
      `If you delete your account, all associated data including reviews, scan records, and business profiles are permanently deleted within 30 days.`,
    ],
  },
  {
    id: 'contact',
    icon: MessageCircle,
    badge: { label: 'Contact', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    title: '11. Contact Information',
    isContact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-20 px-4">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-brand-400" />
            Last updated: {EFFECTIVE_DATE}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Privacy{' '}
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            We believe in radical transparency. Here's exactly what we collect, why we collect it,
            and how we protect it.
          </p>
        </motion.div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <motion.div {...fadeUp(0.1)} className="glass-card p-6 mb-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Navigation
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors py-1 group"
              >
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                {s.title.replace(/^\d+\.\s/, '')}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            id={section.id}
            {...fadeUp(i * 0.05)}
            className="glass-card p-8 scroll-mt-20"
          >
            <SectionBadge icon={section.icon} label={section.badge.label} color={section.badge.color} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>

            {section.content && section.content.map((para, j) => (
              <p key={j} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}

            {section.items && (
              <div className="space-y-3 mt-2">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.label}: </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.isContact && (
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <a
                  href={CONTACT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">WhatsApp Support</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">{CONTACT_PHONE}</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">ReviewBoost</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">privacy@reviewboost.app</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Back links */}
        <div className="flex items-center gap-4 pt-4">
          <Link to="/" className="btn-secondary !py-2 !px-4 text-sm">← Home</Link>
          <Link to="/terms" className="btn-secondary !py-2 !px-4 text-sm">Terms of Service</Link>
          <Link to="/support" className="btn-primary !py-2 !px-4 text-sm">Get Support</Link>
        </div>
      </div>
    </div>
  )
}
