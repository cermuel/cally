import { toast } from 'vue-sonner'
import { getApiErrorMessage } from '~/utils/api/client'
import { googleApi, type GoogleAuthIntent } from '~/utils/api/google'

const googleReturnPathKey = 'cally-google-return-path'
const googleIntentKey = 'cally-google-intent'

const isSafeAppPath = (value: string) =>
  value === '/app' || value.startsWith('/app/')

export const useGoogleOAuth = () => {
  const apiClient = useApiClient()
  const pending = ref(false)

  const callbackUrl = () => new URL('/google/callback', window.location.origin).toString()

  const rememberFlow = (
    intent: GoogleAuthIntent,
    path: string,
  ) => {
    const safePath = isSafeAppPath(path) ? path : '/app/bookings'
    sessionStorage.setItem(googleReturnPathKey, safePath)
    sessionStorage.setItem(googleIntentKey, intent)
  }

  const startAuth = async (intent: GoogleAuthIntent, returnPath?: string) => {
    if (!import.meta.client || pending.value) return

    pending.value = true

    try {
      rememberFlow(intent, returnPath ?? '/app/bookings')
      const response = await googleApi.getAuthRedirect(apiClient, {
        intent,
        redirect_uri: callbackUrl(),
      })

      window.location.assign(response.url)
    } catch (error) {
      pending.value = false
      toast.error(
        getApiErrorMessage(error, 'Unable to continue with Google. Please try again.'),
      )
    }
  }

  const connectCalendar = async (returnPath = '/app/onboarding?step=calendar') => {
    if (!import.meta.client || pending.value) return

    pending.value = true

    try {
      const safePath = isSafeAppPath(returnPath)
        ? returnPath
        : '/app/settings'
      sessionStorage.setItem(googleReturnPathKey, safePath)
      const response = await googleApi.getCalendarRedirect(apiClient)

      window.location.assign(response.url)
    } catch (error) {
      pending.value = false
      toast.error(
        getApiErrorMessage(error, 'Unable to connect Google Calendar. Please try again.'),
      )
    }
  }

  const takeReturnPath = (fallback: string) => {
    if (!import.meta.client) return fallback

    const storedPath = sessionStorage.getItem(googleReturnPathKey)
    sessionStorage.removeItem(googleReturnPathKey)

    return storedPath && isSafeAppPath(storedPath) ? storedPath : fallback
  }

  const getIntent = (): GoogleAuthIntent => {
    if (!import.meta.client) return 'login'

    const storedIntent = sessionStorage.getItem(googleIntentKey)

    return storedIntent === 'register' ? storedIntent : 'login'
  }

  const clearIntent = () => {
    if (import.meta.client) {
      sessionStorage.removeItem(googleIntentKey)
    }
  }

  return {
    connectCalendar,
    clearIntent,
    getIntent,
    pending: readonly(pending),
    startAuth,
    takeReturnPath,
  }
}
