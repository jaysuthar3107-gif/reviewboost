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
 * We wait for the session to be established, then redirect accordingly.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    // These refs hold cleanup handles so the effect cleanup function
    // (returned synchronously) can cancel them even if the async work
    // hasn't finished yet.
    let subscription = null
    let timeout = null

    async function handleCallback() {
      // supabase-js exchanges the PKCE code automatically when detectSessionInUrl: true.
      // Give it a tick to complete, then check if a session already exists.
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[AuthCallback] Session error:', error.message)
        navigate('/login?error=oauth_failed', { replace: true })
        return
      }

      if (data?.session) {
        // Session already established — go straight to dashboard
        navigate('/dashboard', { replace: true })
        return
      }

      // Session not ready yet — PKCE code exchange is still in flight.
      // Listen for the SIGNED_IN event from onAuthStateChange.
      const { data: listenerData } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            clearTimeout(timeout)
            subscription?.unsubscribe()
            navigate('/dashboard', { replace: true })
          } else if (
            event === 'SIGNED_OUT' ||
            (event !== 'INITIAL_SESSION' && !session)
          ) {
            clearTimeout(timeout)
            subscription?.unsubscribe()
            navigate('/login?error=oauth_failed', { replace: true })
          }
        }
      )

      subscription = listenerData.subscription

      // Safety timeout — if nothing fires in 10 s, give up and send to login
      timeout = setTimeout(() => {
        subscription?.unsubscribe()
        navigate('/login?error=timeout', { replace: true })
      }, 10_000)
    }

    handleCallback()

    // Cleanup runs synchronously when the component unmounts, cancelling
    // the listener and timeout regardless of where the async work is.
    return () => {
      clearTimeout(timeout)
      subscription?.unsubscribe()
    }
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
