import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/auth'
import type { MeResponse } from '@/types/models'
import { UserRoleName } from '@/types/enums'

interface AuthContextValue {
  user: MeResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<MeResponse | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await authApi.login(
        email,
        password,
      )

      localStorage.setItem(
        'access_token',
        token.access_token,
      )

      const me = await authApi.me()
      setUser(me)
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token')
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role_name === UserRoleName.ADMIN,
      login,
      logout,
      refreshUser: loadUser,
    }),
    [user, isLoading, login, logout, loadUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    )
  }

  return ctx
}
