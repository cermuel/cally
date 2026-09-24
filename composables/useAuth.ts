import type { AuthUser } from '../utils/api/auth'

const tokenStorageKey = 'cally-auth-token'
const userStorageKey = 'cally-auth-user'

export type AuthState =
  | 'unauthenticated'
  | 'needs_email_verification'
  | 'needs_onboarding'
  | 'authenticated'

export function useAuth() {
  const token = useState<string | null>('auth:token', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)

  const hydrateAuth = () => {
    if (!import.meta.client || token.value || user.value) {
      return
    }

    token.value = localStorage.getItem(tokenStorageKey)

    const storedUser = localStorage.getItem(userStorageKey)

    if (!storedUser) {
      return
    }

    try {
      user.value = JSON.parse(storedUser) as AuthUser
    } catch {
      localStorage.removeItem(userStorageKey)
    }
  }

  const setAuth = (nextToken: string, nextUser: AuthUser) => {
    token.value = nextToken
    user.value = nextUser

    if (import.meta.client) {
      localStorage.setItem(tokenStorageKey, nextToken)
      localStorage.setItem(userStorageKey, JSON.stringify(nextUser))
    }
  }

  const setUser = (nextUser: AuthUser) => {
    user.value = nextUser

    if (import.meta.client) {
      localStorage.setItem(userStorageKey, JSON.stringify(nextUser))
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem(tokenStorageKey)
      localStorage.removeItem(userStorageKey)
    }
  }

  const authState = computed<AuthState>(() => {
    if (!token.value) {
      return 'unauthenticated'
    }

    if (!user.value?.email_verified_at) {
      return 'needs_email_verification'
    }

    if (!user.value.onboarding_completed_at) {
      return 'needs_onboarding'
    }

    return 'authenticated'
  })

  hydrateAuth()

  return {
    authState,
    clearAuth,
    hydrateAuth,
    setAuth,
    setUser,
    token,
    user,
  }
}
