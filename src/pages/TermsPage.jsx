import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText, CheckSquare, QrCode, Star, User, ShieldAlert,
  Copyright, XCircle, Scale, AlertTriangle, RefreshCw,
  MessageCircle, ChevronRight, Zap,
} from 'lucide-react'

const EFFECTIVE_DATE = 'May 15, 2025'
const COMPANY_NAME   = 'ReviewBoost'
const CONTACT_WA     = 'https://wa.me/918154887982'
const CONTACT_PHONE  = '+91 81548 87982'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

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
    id: 'acceptance',
    icon: CheckSquare,
    badge: { label: 'Agreement', color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' },
    title: '1. Acceptance of Terms',
    content: [
      `By accessing or using ${COMPANY_NAME} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the platform.`,
      `${COMPANY_NAME} reserves the right to update these terms at any time. Continued use of the platform after any change constitutes your acceptance of the new terms.`,
    ],
  },
  {
    id: 'usage',
    icon: FileText,
    badge: { label: 'Usage Rules', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    title: '2. Platform Usage Rules',
    items: [
      'You must be at least 18 years old to use ReviewBoost.',
      'You must provide accurate and truthful information when creating your account.',
      'You may not use the platform for any illegal, fraudulent, or harmful purpose.',
      'You are responsible for maintaining the security of your account credentials.',
      'You may not transfer, sell, or sublicense your account to any third party.',
      'Automated bots, scrapers, or mass-submission tools are strictly prohibited.',
    ],
  },
  {
    id: 'qr-usage',
    icon: QrCode,
    badge: { label: 'QR Codes', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    title: '3. QR Code Usage',
    content: [
      `Each ${COMPANY_NAME} account is issued a unique QR code linked to your business review page. QR codes are for your business use only and must not be used to redirect customers to third-party businesses.`,
      `You are responsible for where and how you display your QR code. ${COMPANY_NAME} is not liable for any misuse, tampering, or unauthorized distribution of your QR code by third parties.`,
    ],
  },
  {
    id: 'review',
    icon: Star,
    badge: { label: 'Reviews', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    title: '4. Review Responsibility',
    content: [
      `${COMPANY_NAME} provides tools to collect and direct customer reviews. You acknowledge that you will not use the platform to solicit fake, misleading, or incentivized reviews in violation of Google's review policies or any applicable regulations.`,
      `You are solely responsible for ensuring your use of review collection tools complies with the terms of service of Google Business Profile and other applicable platforms. ${COMPANY_NAME} bears no liability for any penalties imposed on your Google Business Profile.`,
    ],
  },
  {
    id: 'accounts',
    icon: User,
    badge: { label: 'Accounts', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    title: '5. User Accounts',
    items: [
      'One account per business entity. Multiple accounts for the same business are not permitted.',
      'You are responsible for all activity that occurs under your account.',
      'If you suspect unauthorized access, contact support immediately.',
      'We reserve the right to suspend accounts that violate these terms without prior notice.',
      'Account data is associated with the email used at registration. Changing email requires contacting support.',
    ],
  },
  {
    id: 'abuse',
    icon: ShieldAlert,
    badge: { label: 'Abuse Prevention', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    title: '6. Abuse & Spam Prevention',
    content: [
      `You must not use ${COMPANY_NAME} to spam, harass, or solicit reviews in a deceptive manner. This includes sending mass messages, creating fake customer personas, or flooding Google reviews with manufactured content.`,
      `We actively monitor for abusive usage patterns. Accounts found to be in violation will be immediately suspended and reported to relevant authorities if applicable.`,
    ],
  },
  {
    id: 'ip',
    icon: Copyright,
    badge: { label: 'IP Rights', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    title: '7. Intellectual Property',
    content: [
      `All content, design, code, and branding of ${COMPANY_NAME} — including its logo, interface design, generated QR codes, and proprietary algorithms — are the sole intellectual property of ReviewBoost and its owners.`,
      `You may not copy, reproduce, distribute, or create derivative works from any part of the ${COMPANY_NAME} platform without explicit written permission. Feedback data entered by your customers remains your property; ReviewBoost only stores it to power your dashboard.`,
    ],
  },
  {
    id: 'suspension',
    icon: XCircle,
    badge: { label: 'Suspension', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    title: '8. Account Suspension',
    items: [
      'Using the platform for illegal activities or fraud.',
      'Generating fake reviews or misrepresenting your business.',
      'Attempting to hack, exploit, or reverse-engineer the platform.',
      'Violating any Google or third-party platform terms of service.',
      'Non-payment if a paid tier is introduced in the future.',
      'Abandonment: accounts with no activity for 12+ months may be removed.',
    ],
    itemsLabel: 'Your account may be suspended or terminated for:',
  },
  {
    id: 'liability',
    icon: Scale,
    badge: { label: 'Liability', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400' },
    title: '9. Limitation of Liability',
    content: [
      `To the maximum extent permitted by applicable law, ${COMPANY_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, goodwill, or business interruption — arising out of your use of or inability to use the platform.`,
      `Our total liability to you for any claim arising from use of the platform shall not exceed the amount you paid us in the 12 months preceding the claim.`,
    ],
  },
  {
    id: 'disclaimer',
    icon: AlertTriangle,
    badge: { label: 'Disclaimer', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    title: '10. Disclaimer',
    content: [
      `${COMPANY_NAME} is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the platform will be error-free, uninterrupted, secure, or free of viruses.`,
      `We do not guarantee any specific results from use of the platform, including improvement in Google review counts, star ratings, or business reputation.`,
    ],
  },
  {
    id: 'changes',
    icon: RefreshCw,
    badge: { label: 'Updates', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    title: '11. Changes to Terms',
    content: [
      `We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes via the platform or by email. Your continued use of ${COMPANY_NAME} after such changes constitutes your acceptance of the new terms.`,
      `The date of the most recent revision is always shown at the top of this page. We encourage you to review these terms periodically.`,
    ],
  },
  {
    id: 'contact-support',
    icon: MessageCircle,
    badge: { label: 'Contact', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    title: '12. Contact Support',
    isContact: true,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 py-20 px-4">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <FileText className="w-4 h-4 text-accent-400" />
            Effective Date: {EFFECTIVE_DATE}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Terms of{' '}
            <span className="bg-gradient-to-r from-accent-400 to-brand-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            These terms govern your use of ReviewBoost. Please read them carefully before creating an account.
          </p>
        </motion.div>
      </div>

      {/* ToC */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <motion.div {...fadeUp(0.1)} className="glass-card p-6 mb-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Table of Contents
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
            {...fadeUp(i * 0.04)}
            className="glass-card p-8 scroll-mt-20"
          >
            <SectionBadge icon={section.icon} label={section.badge.label} color={section.badge.color} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>

            {section.content && section.content.map((para, j) => (
              <p key={j} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}

            {section.items && (
              <>
                {section.itemsLabel && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{section.itemsLabel}</p>
                )}
                <div className="space-y-2">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0 mt-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {section.isContact && (
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <a
                  href={CONTACT_WA}
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
                <Link
                  to="/support"
                  className="flex items-center gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 hover:border-brand-400 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-700 dark:text-brand-400 text-sm">Support Center</p>
                    <p className="text-xs text-brand-600 dark:text-brand-500">View FAQs &amp; get help</p>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        ))}

        {/* Navigation */}
        <div className="flex items-center gap-4 pt-4">
          <Link to="/" className="btn-secondary !py-2 !px-4 text-sm">← Home</Link>
          <Link to="/privacy" className="btn-secondary !py-2 !px-4 text-sm">Privacy Policy</Link>
          <Link to="/support" className="btn-primary !py-2 !px-4 text-sm">Get Support</Link>
        </div>
      </div>
    </div>
  )
}
