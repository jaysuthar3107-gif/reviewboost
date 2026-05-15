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
  // Start loading=true — we don't know the session yet
  const [loading, setLoading] = useState(true)

  // Guard: only one fetchBusiness call at a time per userId
  const fetchingFor = useRef(null)
  // Track if the initial session check is done
  const initialized = useRef(false)

  useEffect(() => {
    // ── Single source of truth: onAuthStateChange ───────────────────────────
    // supabase-js v2 fires INITIAL_SESSION synchronously on subscribe
    // (or very shortly after), which replaces the need for a separate
    // getSession() call. This avoids the double-fetch race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null
        console.log('[Auth] onAuthStateChange →', event, '| user:', sessionUser?.id ?? 'none')

        setUser(sessionUser)

        if (sessionUser) {
          // Don't block the state update — fetch business in background
          fetchBusiness(sessionUser.id)
        } else {
          setBusiness(null)
          setLoading(false)
        }

        // Mark initialized so we only setLoading(false) once after the
        // INITIAL_SESSION event fires (covers refresh + first load)
        if (!initialized.current) {
          initialized.current = true
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch the business row for this user ────────────────────────────────
  async function fetchBusiness(userId) {
    if (fetchingFor.current === userId) {
      console.log('[Auth] fetchBusiness — already in flight for', userId, ', skipping')
      return
    }
    fetchingFor.current = userId
    console.log('[Auth] fetchBusiness START — user:', userId)

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
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
      setLoading(false)
      console.log('[Auth] fetchBusiness DONE — setLoading(false)')
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
    // onAuthStateChange fires SIGNED_IN → fetchBusiness runs automatically
    return data
  }

  // ── Google OAuth (redirects browser; session handled on /auth/callback) ──
  async function signInWithGoogle() {
    return googleOAuth()
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut()
    // onAuthStateChange fires SIGNED_OUT → clears user + business automatically
  }

  // ── Update the business profile ───────────────────────────────────────────
  async function updateBusiness(updates) {
    if (!user) throw new Error('Not authenticated')

    console.log('[Auth] updateBusiness START — user:', user.id, '| updates:', updates)

    let data, error
    try {
      ;({ data, error } = await withTimeout(
        supabase
          .from('businesses')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .maybeSingle(),
        10_000,
        'updateBusiness'
      ))
    } catch (timeoutErr) {
      console.error('[Auth] updateBusiness — TIMED OUT:', timeoutErr.message)
      throw timeoutErr
    }

    console.log('[Auth] updateBusiness result → data:', data, '| error:', error)

    if (error) {
      console.error('[Auth] updateBusiness Supabase error:', error.message, '| code:', error.code)
      throw error
    }

    if (!data) {
      const msg = 'Update returned no data — check Supabase RLS policies and that the businesses row exists for this user.'
      console.error('[Auth] updateBusiness —', msg)
      throw new Error(msg)
    }

    console.log('[Auth] updateBusiness SUCCESS:', data)
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
    // Manual refresh — clears guard so callers can force a re-fetch
    refreshBusiness: async () => {
      if (!user) return
      console.log('[Auth] refreshBusiness called')
      fetchingFor.current = null
      await fetchBusiness(user.id)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
