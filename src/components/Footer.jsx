import { useTranslation } from 'react-i18next'
import { Zap, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const WHATSAPP_URL = 'https://wa.me/918154887982'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center group-hover:shadow-glow-blue transition-all duration-300">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">ReviewBoost</span>
          </Link>

          {/* Tagline */}
          <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1 order-last md:order-none">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 mx-0.5" /> for local businesses
          </p>

          {/* Links */}
          <div className="flex items-center gap-5 text-xs text-gray-400 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-brand-500 transition-colors font-medium">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-brand-500 transition-colors font-medium">
              Terms
            </Link>
            <Link to="/support" className="hover:text-brand-500 transition-colors font-medium">
              Support
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} ReviewBoost. All rights reserved. ·{' '}
            <Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
