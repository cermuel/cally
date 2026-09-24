import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie<string | null>('cally-auth-token')
  const apiBaseUrl = config.public.apiBaseUrl
    ? `${config.public.apiBaseUrl.replace(/\/$/, '')}/api`
    : '/api'

  const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use((request) => {
    const token = import.meta.client
      ? localStorage.getItem('cally-auth-token') || tokenCookie.value
      : tokenCookie.value

    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }

    return request
  })

  return {
    provide: {
      axios: api,
    },
  }
})
