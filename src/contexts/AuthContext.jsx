import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase, signInWithGoogle as googleOAuth } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

// ── Helper: race a promise against a timeout ──────────────────────────────
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`[Auth] ${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  // Guard against running fetchBusiness for the same userId twice concurrently
  const fetchingFor = useRef(null)

  useEffect(() => {
    // ── 1. Restore session on mount ───────────────────────────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null
      console.log('[Auth] getSession →', sessionUser ? `user ${sessionUser.id}` : 'no session')
      setUser(sessionUser)
      if (sessionUser) {
        fetchBusiness(sessionUser.id)
      } else {
        setLoading(false)
      }
    }).catch(err => {
      console.error('[Auth] getSession threw:', err)
      setLoading(false)
    })

    // ── 2. Keep session in sync (login, logout, token refresh, OAuth return) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null
        console.log('[Auth] onAuthStateChange event:', event, '→ user:', sessionUser?.id ?? 'none')
        setUser(sessionUser)

        if (sessionUser) {
          await fetchBusiness(sessionUser.id)
        } else {
          setBusiness(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch the business row that belongs to this user ──────────────────────
  async function fetchBusiness(userId) {
    // Clear any stale guard so we never deadlock
    if (fetchingFor.current === userId) {
      console.log('[Auth] fetchBusiness — already fetching for', userId, ', skipping')
      return
    }
    fetchingFor.current = userId
    console.log('[Auth] fetchBusiness START for user:', userId)

    try {
      console.log('[Auth] Querying businesses table for user_id:', userId)
      const { data, error } = await withTimeout(
        supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),  // returns null (not error) when no row found
        10_000,
        'fetchBusiness'
      )

      console.log('[Auth] fetchBusiness result → data:', data, '| error:', error)

      if (error) {
        console.error('[Auth] fetchBusiness error:', error.message, '| code:', error.code)
      }

      setBusiness(data ?? null)
    } catch (err) {
      console.error('[Auth] fetchBusiness threw:', err.message)
      setBusiness(null)
    } finally {
      fetchingFor.current = null
      console.log('[Auth] fetchBusiness DONE — setLoading(false)')
      setLoading(false)
    }
  }

  // ── Email sign-up: create auth user then insert business row ──────────────
  async function signUp(email, password, businessName, googleReviewUrl) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const newUser = data?.user ?? data?.session?.user
    if (!newUser) throw new Error('Sign-up succeeded but no user was returned.')

    const slug = businessName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    console.log('[Auth] signUp — inserting business for user:', newUser.id)
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .insert({
        user_id: newUser.id,
        name: businessName,
        google_review_url: googleReviewUrl || null,
        slug,
      })
      .select()
      .single()

    if (bizError) throw bizError
    console.log('[Auth] signUp — business inserted:', biz)

    setBusiness(biz)
    return data
  }

  // ── Email sign-in ─────────────────────────────────────────────────────────
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange fires → fetchBusiness runs automatically
    return data
  }

  // ── Google OAuth (redirects browser; session handled on /auth/callback) ───
  async function signInWithGoogle() {
    return googleOAuth()
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setBusiness(null)
  }

  // ── Update the business profile ───────────────────────────────────────────
  async function updateBusiness(updates) {
    if (!user) throw new Error('Not authenticated')

    console.log('[Auth] updateBusiness START — user:', user.id, '| updates:', updates)

    const query = supabase
      .from('businesses')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()  // avoids PGRST116 crash if RLS blocks the row

    let data, error
    try {
      ;({ data, error } = await withTimeout(query, 10_000, 'updateBusiness'))
    } catch (timeoutErr) {
      console.error('[Auth] updateBusiness — TIMED OUT:', timeoutErr.message)
      throw timeoutErr
    }

    console.log('[Auth] updateBusiness result → data:', data, '| error:', error)

    if (error) {
      console.error('[Auth] updateBusiness Supabase error:', error.message, '| code:', error.code, '| details:', error.details)
      throw error
    }

    if (!data) {
      const msg = 'Update returned no data — check Supabase RLS policies and that the businesses row exists for this user.'
      console.error('[Auth] updateBusiness —', msg)
      throw new Error(msg)
    }

    console.log('[Auth] updateBusiness SUCCESS — setBusiness:', data)
    setBusiness(data)
    return data
  }

  const value = {
    user,
    business,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateBusiness,
    // Manual refresh — always bypasses the concurrency guard so callers can await it reliably
    refreshBusiness: async () => {
      if (!user) return
      console.log('[Auth] refreshBusiness called')
      fetchingFor.current = null  // clear guard so fetchBusiness will run
      await fetchBusiness(user.id)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
