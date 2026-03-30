import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AuthSession, LoginCredentials } from '@/api/enhance/types'

const STORAGE_KEY = 'enhance_session'

interface AuthContextType {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
})

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.token && parsed.apiUrl && parsed.orgId) return parsed
    return null
  } catch {
    return null
  }
}

function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadSession)

  // Sync session to API client on mount and changes
  useEffect(() => {
    if (session) {
      // Import dynamically to avoid circular deps
      import('@/api/enhance/client').then(({ configureClient }) => {
        configureClient(session.token, session.apiUrl, session.orgId)
      })
    }
  }, [session])

  const login = useCallback(async (credentials: LoginCredentials) => {
    // Step 1: Login to Enhance API via our proxy (apiUrl comes from env on server)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(body.message || `Login failed (${res.status})`)
    }

    const data = await res.json()

    const newSession: AuthSession = {
      token: data.token,
      apiUrl: data.apiUrl,
      orgId: data.orgId || '',
      email: credentials.email,
    }

    saveSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    import('@/api/enhance/client').then(({ resetClient }) => {
      resetClient()
    })
  }, [])

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
