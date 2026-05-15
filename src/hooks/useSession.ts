'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '@/types'

interface UseSessionResult {
  session: SessionUser | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })

      if (res.status === 401) {
        setSession(null)
        return
      }

      if (!res.ok) {
        throw new Error(`Erro ao buscar sessão: ${res.status}`)
      }

      const body = await res.json()
      setSession(body.data as SessionUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSession()
  }, [fetchSession])

  return { session, loading, error, refresh: fetchSession }
}

// ─── useRequireAuth ───────────────────────────────────────────────────────────

interface UseRequireAuthOptions {
  /** Redirect if the user does NOT have one of these profiles. */
  allowedProfiles?: SessionUser['perfil'][]
  /** Override redirect path (defaults to /login). */
  redirectTo?: string
}

interface UseRequireAuthResult extends UseSessionResult {
  authorized: boolean
}

export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthResult {
  const { allowedProfiles, redirectTo = '/login' } = options
  const { session, loading, error, refresh } = useSession()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!session) {
      router.replace(redirectTo)
      setAuthorized(false)
      return
    }

    if (session.primeiroAcesso) {
      router.replace('/first-access')
      setAuthorized(false)
      return
    }

    if (allowedProfiles && !allowedProfiles.includes(session.perfil)) {
      router.replace('/dashboard')
      setAuthorized(false)
      return
    }

    setAuthorized(true)
  }, [session, loading, router, redirectTo, allowedProfiles])

  return { session, loading, error, refresh, authorized }
}
