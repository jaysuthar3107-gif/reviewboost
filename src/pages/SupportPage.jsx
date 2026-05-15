import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageCircle, Phone, Mail, Clock, ChevronDown, ChevronUp,
  Zap, HelpCircle, CheckCircle, Star, QrCode, Shield, ArrowRight,
} from 'lucide-react'

const WHATSAPP_URL   = 'https://wa.me/918154887982'
const CONTACT_PHONE  = '+91 81548 87982'
const CONTACT_EMAIL  = 'support@reviewboost.app'
const RESPONSE_TIME  = '< 2 hours'

// ── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How do I get my QR code?',
    a: 'After signing up and setting up your business profile in Settings, your unique QR code is automatically generated and available on your Dashboard. You can download it as PNG or SVG and print it for your business.',
  },
  {
    q: 'Why is my dashboard not showing new reviews?',
    a: 'The dashboard uses real-time Supabase subscriptions. If it\'s not updating, make sure your Supabase anon key in your .env file is a valid JWT key (starts with "eyJ..."). You can also click the "Refresh" button on the dashboard manually.',
  },
  {
    q: 'What happens when a customer scans my QR code?',
    a: 'The customer is taken to a branded review page. They select a star rating. 4–5 star customers are shown a link to leave a Google review. 1–3 star customers are shown a private feedback form — protecting your Google rating from negative public reviews.',
  },
  {
    q: 'Can I use ReviewBoost with multiple business locations?',
    a: 'Currently, one account supports one business profile. Multi-location support is on our roadmap. Contact us on WhatsApp to discuss your needs — we can explore custom arrangements.',
  },
  {
    q: 'Is my customer data secure?',
    a: 'Yes. All data is stored on Supabase with Row-Level Security (RLS) so only you can access your own review data. Customer feedback is never sold or shared with third parties. Connections use HTTPS/TLS encryption.',
  },
  {
    q: 'How do I change my Google Review link?',
    a: 'Go to Settings → Business Profile → Google Review URL. Paste your link from Google Business Profile (Get more reviews → Share review form). Save your changes.',
  },
  {
    q: 'Do I need to pay to use ReviewBoost?',
    a: 'ReviewBoost is currently in early access. Core features are free to use. We may introduce a paid tier with advanced analytics and multi-location support in the future. Early users will be grandfathered with special pricing.',
  },
  {
    q: 'Why is the "Save Profile" button spinning forever?',
    a: 'This is usually caused by an invalid Supabase API key. Go to your Supabase Dashboard → Settings → API and copy the "anon public" JWT key (starts with "eyJ...") into your VITE_SUPABASE_ANON_KEY environment variable. Restart the dev server after.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Contact us on WhatsApp with your registered email. We will permanently delete your account and all associated data within 30 days as per our Privacy Policy.',
  },
  {
    q: 'The review page shows "Business Not Found" — what do I do?',
    a: 'This happens if your QR code link is using an old or incorrect slug. Go to Settings and check that your business profile is saved. Your review link is shown in Settings → Your Review Link. Use that exact URL for your QR code.',
  },
]

// ── Support channels ──────────────────────────────────────────────────────────
const channels = [
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    title: 'WhatsApp',
    subtitle: 'Fastest response',
    info: CONTACT_PHONE,
    cta: 'Chat Now',
    href: WHATSAPP_URL,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    external: true,
  },
  {
    icon: Phone,
    title: 'Phone / Call',
    subtitle: 'Mon–Sat, 10am–7pm IST',
    info: CONTACT_PHONE,
    cta: 'Call Now',
    href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`,
    color: 'from-brand-500 to-brand-600',
    bg: 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800',
    textColor: 'text-brand-700 dark:text-brand-400',
    external: false,
  },
  {
    icon: Mail,
    title: 'Email',
    subtitle: 'Response within 24 hours',
    info: CONTACT_EMAIL,
    cta: 'Send Email',
    href: `mailto:${CONTACT_EMAIL}`,
    color: 'from-accent-500 to-accent-600',
    bg: 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800',
    textColor: 'text-accent-700 dark:text-accent-400',
    external: false,
  },
]

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {q}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-brand-500 text-white rotate-0'
            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
        }`}>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5">
              <div className="h-px bg-gray-100 dark:bg-white/10 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 py-24 px-4">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Support team is online
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            How can we{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-brand-400 bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
            Our team is ready to help you grow your review count and resolve any issues quickly.
          </p>

          {/* Quick CTA */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* ── Response time banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Clock, label: 'Avg Response', value: RESPONSE_TIME, color: 'text-brand-500' },
            { icon: CheckCircle, label: 'Resolution Rate', value: '98%', color: 'text-emerald-500' },
            { icon: Star, label: 'Support Rating', value: '4.9★', color: 'text-yellow-500' },
            { icon: MessageCircle, label: 'Happy Businesses', value: '500+', color: 'text-accent-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 text-center"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Contact Channels ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-500" />
            Contact Us
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Choose the channel that works best for you.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {channels.map((ch, i) => (
              <motion.a
                key={i}
                href={ch.href}
                target={ch.external ? '_blank' : undefined}
                rel={ch.external ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`glass-card p-6 border ${ch.bg} group cursor-pointer transition-all duration-300 block`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ch.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <ch.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold text-lg ${ch.textColor} mb-1`}>{ch.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{ch.subtitle}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{ch.info}</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${ch.textColor} group-hover:gap-2.5 transition-all`}>
                  {ch.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── Features quick guide ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-500" />
            Quick Start Guide
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">New to ReviewBoost? Here's how to get started in 3 steps.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Shield,
                title: 'Create Account',
                desc: 'Sign up with email or Google. Your account is ready instantly.',
                color: 'from-brand-500 to-brand-600',
              },
              {
                step: '02',
                icon: QrCode,
                title: 'Set Up Business',
                desc: 'Add your business name and Google Review link in Settings. Your QR code is generated automatically.',
                color: 'from-accent-500 to-accent-600',
              },
              {
                step: '03',
                icon: Star,
                title: 'Collect Reviews',
                desc: 'Print your QR code, display it at your business, and watch reviews roll in on your dashboard.',
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent z-0" />
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Step {step.step}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-brand-500" />
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Can't find your answer? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline">Chat with us on WhatsApp.</a>
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <FaqItem
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 text-center"
        >
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Still need help?</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Our support team typically responds within {RESPONSE_TIME}. We're here to make sure ReviewBoost works perfectly for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
              <Link to="/dashboard" className="btn-secondary !py-3 text-sm">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-secondary !py-2 !px-4 text-sm">← Home</Link>
          <Link to="/privacy" className="btn-secondary !py-2 !px-4 text-sm">Privacy Policy</Link>
          <Link to="/terms" className="btn-secondary !py-2 !px-4 text-sm">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
