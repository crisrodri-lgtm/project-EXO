'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authenticate, routeForRole, type MockUser, type UserRole } from '@/../BE_BASE'

// Bloque de contexto de sesión

type SessionState = {
  user: MockUser | null
  login: (email: string, password: string) => MockUser | null
  logout: () => void
  isAuthenticated: boolean
  role: UserRole | null
}

const AuthContext = createContext<SessionState | null>(null)

const STORAGE_KEY = 'biblonexo:session'

function loadStoredUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = JSON.parse(raw) as string
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)

  const login = useCallback((email: string, password: string) => {
    const found = authenticate(email, password)
    if (found) {
      setUser(found)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found.id))
      }
    }
    return found
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<SessionState>(() => ({
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    role: user?.role ?? null,
  }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export { routeForRole }
