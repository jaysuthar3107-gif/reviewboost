import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, Building2, Link2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import GoogleAuthButton from '../components/GoogleAuthButton'

const passwordChecks = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'Contains a number', test: p => /\d/.test(p) },
  { label: 'Contains a letter', test: p => /[a-zA-Z]/.test(p) },
]

export default function SignupPage() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', businessName: '', googleUrl: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.businessName, form.googleUrl)
      toast.success('Account created! 🎉 Check your email to verify.')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-mesh items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl float-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-brand-500/20 rounded-full blur-3xl float-medium" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative text-center text-white max-w-sm"
        >
          <div className="text-8xl mb-6 animate-float">⭐</div>
          <h2 className="text-3xl font-black mb-3">Start collecting 5-star reviews today</h2>
          <p className="text-white/60">Join 10,000+ businesses already using ReviewBoost to grow their online reputation.</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { n: 'Free', l: 'To Start' },
              { n: '2 min', l: 'Setup' },
              { n: '∞', l: 'Reviews' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xl font-black text-white">{s.n}</div>
                <div className="text-xs text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-surface-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-gradient">ReviewBoost</span>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('createAccount')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
                {t('signIn')}
              </Link>
            </p>

            {/* ── Google OAuth ── */}
            <GoogleAuthButton label="Sign up with Google" />

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('businessName')}</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={e => update('businessName', e.target.value)}
                    className="input-field pl-10"
                    placeholder="My Awesome Business"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('googleReviewUrl')}</label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={form.googleUrl}
                    onChange={e => update('googleUrl', e.target.value)}
                    className="input-field pl-10"
                    placeholder="https://g.page/r/..."
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Find this in Google Business Profile → Share review form</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@business.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    {passwordChecks.map((c, i) => {
                      const ok = c.test(form.password)
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle className={`w-3.5 h-3.5 ${ok ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                          <span className={ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>{c.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>{t('createAccount')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-5">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
