import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * Standalone "Continue with Google" button.
 * Drop into any page — calls Supabase OAuth which redirects the browser.
 * Loading state prevents double-clicks while the redirect is in flight.
 */
export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await signInWithGoogle()
      // Browser redirects away — loading spinner stays visible until navigation
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      id="google-auth-btn"
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-3
        h-12 px-5 rounded-xl font-semibold text-sm
        bg-white dark:bg-white/10
        border border-gray-200 dark:border-white/15
        text-gray-700 dark:text-gray-200
        shadow-sm hover:shadow-md
        hover:bg-gray-50 dark:hover:bg-white/20
        hover:border-gray-300 dark:hover:border-white/30
        active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
      "
    >
      {loading ? (
        <>
          {/* Spinner */}
          <svg
            className="animate-spin w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Redirecting to Google…</span>
        </>
      ) : (
        <>
          {/* Official Google "G" logo SVG */}
          <svg
            className="w-5 h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
