import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Zap, Star, QrCode, BarChart3, Globe, Shield,
  ArrowRight, CheckCircle, Sparkles, TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: QrCode,
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    color: 'from-brand-500 to-brand-600',
    glow: 'glow-blue',
  },
  {
    icon: Sparkles,
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    color: 'from-accent-500 to-accent-600',
    glow: 'glow-purple',
  },
  {
    icon: Shield,
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    color: 'from-emerald-500 to-emerald-600',
    glow: 'glow-blue',
  },
  {
    icon: BarChart3,
    titleKey: 'feature4Title',
    descKey: 'feature4Desc',
    color: 'from-gold-400 to-gold-500',
    glow: 'glow-gold',
  },
  {
    icon: Globe,
    titleKey: 'feature5Title',
    descKey: 'feature5Desc',
    color: 'from-pink-500 to-rose-500',
    glow: 'glow-purple',
  },
  {
    icon: TrendingUp,
    titleKey: 'feature6Title',
    descKey: 'feature6Desc',
    color: 'from-cyan-500 to-blue-500',
    glow: 'glow-blue',
  },
]

const featureText = {
  en: {
    feature1Title: 'Smart QR Codes', feature1Desc: 'Generate unique QR codes for your business. Print and display anywhere for instant customer access.',
    feature2Title: 'AI Review Generator', feature2Desc: 'AI-powered review suggestions help customers write authentic, compelling reviews in seconds.',
    feature3Title: 'Private Feedback', feature3Desc: 'Low ratings trigger a private form instead of public Google reviews — protect your reputation.',
    feature4Title: 'Real-time Analytics', feature4Desc: 'Track scans, ratings, and trends with beautiful charts and instant insights.',
    feature5Title: 'Multi-language', feature5Desc: 'Full support for English, Gujarati & Hindi — reach every customer in their language.',
    feature6Title: 'Boost Google Ranking', feature6Desc: 'More reviews = better ranking. ReviewBoost supercharges your local SEO effortlessly.',
  }
}

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your account and add your business details & Google review link.' },
  { num: '02', title: 'Get Your QR', desc: 'Download your unique QR code and display it at your business.' },
  { num: '03', title: 'Collect Reviews', desc: 'Customers scan, rate, and post on Google — all in under 30 seconds!' },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const texts = featureText.en

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-mesh overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl float-medium" />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center py-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
            #1 Review Platform for Local Businesses
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
          >
            Get More{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-brand-400 to-accent-400">
                5-Star Reviews
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#fbbf24" /><stop offset="0.5" stopColor="#38bdf8" /><stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />on Google
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10"
          >
            {t('tagline')} — with a QR code, AI-powered suggestions, and smart feedback routing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="btn-primary text-lg px-8 py-4 shadow-glow-blue">
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary !text-white !border-white/30 !bg-white/10 hover:!bg-white/20 text-lg px-8 py-4">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { n: '10K+', l: 'Businesses' },
              { n: '500K+', l: 'Reviews' },
              { n: '4.9★', l: 'App Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="text-2xl font-black text-white">{s.n}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 text-xs animate-bounce">
          <span>Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white dark:bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-blue mb-4">How It Works</span>
            <h2 className="section-title mt-2">Up and running in minutes</h2>
            <p className="section-subtitle">Three simple steps to more Google reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative glass-card p-8 text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-6xl font-black text-gradient opacity-20 absolute top-4 right-6">{s.num}</div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-blue group-hover:shadow-glow-purple transition-all">
                    <span className="text-white font-bold text-xl">{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{s.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                    <ArrowRight className="w-8 h-8 text-brand-300 dark:text-brand-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-surface-card/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-blue mb-4">Features</span>
            <h2 className="section-title mt-2">Everything you need to dominate local search</h2>
            <p className="section-subtitle">Powerful features designed for local business owners</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-hover p-6 group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-${f.glow} group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{texts[f.titleKey]}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{texts[f.descKey]}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-mesh relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-purple animate-pulse-slow">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to boost your reviews?
            </h2>
            <p className="text-white/70 text-xl mb-8">
              Join thousands of local businesses collecting more 5-star reviews every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-10 py-4">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/50 text-sm">
              {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
