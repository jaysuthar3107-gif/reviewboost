import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth completes.
 * The URL will contain either:
 *   - a `code` query param  (PKCE flow — default in Supabase v2)
 *   - or a hash fragment    (implicit flow — older config)
 *
 * supabase-js detects both automatically via detectSessionInUrl: true.
 * We just need to wait for the session to be established, then redirect.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function handleCallback() {
      // Give supabase-js a moment to exchange the code for a session.
      // onAuthStateChange will fire with SIGNED_IN once done.
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[AuthCallback] Session error:', error.message)
        navigate('/login?error=oauth_failed', { replace: true })
        return
      }

      if (data.session) {
        // Session already established — go to dashboard
        navigate('/dashboard', { replace: true })
        return
      }

      // Session not ready yet — listen for it (PKCE code exchange in progress)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            navigate('/dashboard', { replace: true })
          } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
            subscription.unsubscribe()
            navigate('/login?error=oauth_failed', { replace: true })
          }
        }
      )

      // Safety timeout — if nothing fires in 10s, send to login
      const timeout = setTimeout(() => {
        subscription.unsubscribe()
        navigate('/login?error=timeout', { replace: true })
      }, 10_000)

      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center gap-6">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-blue animate-pulse-slow">
          <Zap className="w-10 h-10 text-white" />
        </div>
        {/* Spinning ring */}
        <svg
          className="absolute -inset-3 w-[104px] h-[104px] animate-spin-slow"
          viewBox="0 0 104 104"
          fill="none"
        >
          <circle
            cx="52" cy="52" r="48"
            stroke="url(#ring-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="75 225"
          />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">Signing you in…</h2>
        <p className="text-white/50 text-sm">Completing Google authentication</p>
      </div>

      {/* Dot loader */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
