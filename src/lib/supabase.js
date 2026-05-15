import { createClient } from '@supabase/supabase-js'

// ── Environment variable validation ─────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase] Initializing client...')
console.log('[Supabase] URL:', supabaseUrl || '❌ MISSING')
console.log('[Supabase] Key present:', supabaseAnonKey ? `✅ (starts: ${supabaseAnonKey.slice(0, 12)}...)` : '❌ MISSING')

// Warn about clearly invalid keys (sb_publishable_ is NOT a valid anon key)
if (supabaseAnonKey && supabaseAnonKey.startsWith('sb_publishable_')) {
  console.error(
    '[Supabase] ❌ INVALID ANON KEY — "sb_publishable_" is not a valid Supabase anon key.\n' +
    '   Go to: Supabase Dashboard → Settings → API → "anon public" key (a long JWT starting with "eyJ...")\n' +
    '   Copy that value into VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ❌ Missing environment variables. All DB calls will fail.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

/**
 * Initiate Google OAuth sign-in via Supabase.
 * Supabase redirects the browser to Google, then back to /auth/callback.
 * The callback page finishes the session exchange and navigates to /dashboard.
 */
export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`
  console.log('[Supabase] signInWithGoogle → redirectTo:', redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) throw error
  return data
}

export default supabase
