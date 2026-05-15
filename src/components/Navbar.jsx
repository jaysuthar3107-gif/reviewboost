import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Zap, Moon, Sun, Globe, Menu, X, LayoutDashboard,
  LogOut, Settings, ChevronDown, MessageCircle
} from 'lucide-react'
import i18n from '../lib/i18n'

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setLangOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-surface-dark/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-blue group-hover:shadow-glow-purple transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">ReviewBoost</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {/* Support link */}
            <Link
              to="/support"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors px-2 py-1"
            >
              Support
            </Link>

            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setUserOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang.flag} {currentLang.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 glass-card p-1.5 shadow-card-hover animate-scale-in">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => changeLang(l.code)}
                      className={`lang-option w-full text-left ${i18n.language === l.code ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : ''}`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105"
              title={dark ? t('lightMode') : t('darkMode')}
            >
              {dark ? <Sun className="w-5 h-5 text-gold-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setUserOpen(!userOpen); setLangOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-200/50 dark:border-brand-700/30 hover:from-brand-500/20 hover:to-accent-500/20 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card p-1.5 shadow-card-hover animate-scale-in">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserOpen(false)}
                      className="lang-option flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserOpen(false)}
                      className="lang-option flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> {t('settings')}
                    </Link>
                    <div className="border-t border-gray-100 dark:border-white/10 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="lang-option w-full text-left flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <LogOut className="w-4 h-4" /> {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">{t('login')}</Link>
                <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">{t('signup')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-white/10 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl p-4 space-y-2 animate-slide-up">
          {/* Language */}
          <div className="flex gap-2 flex-wrap">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => { changeLang(l.code); setMenuOpen(false) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  i18n.language === l.code
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <Link to="/support" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
            <MessageCircle className="w-4 h-4" /> Support
          </Link>

          <button
            onClick={() => { toggle(); setMenuOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            {dark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" />}
            {dark ? t('lightMode') : t('darkMode')}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                <Settings className="w-4 h-4" /> {t('settings')}
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                <LogOut className="w-4 h-4" /> {t('logout')}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 !py-2 text-sm text-center">{t('login')}</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 !py-2 text-sm text-center">{t('signup')}</Link>
            </div>
          )}
        </div>
      )}

      {/* Close dropdowns on outside click */}
      {(langOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setLangOpen(false); setUserOpen(false) }} />
      )}
    </nav>
  )
}
