import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
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
    if (!import.meta.client) {
      return request
    }

    const token = localStorage.getItem('cally-auth-token')

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
