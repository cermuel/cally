import type { AxiosInstance } from 'axios'

export function useApiClient(): AxiosInstance {
  return useNuxtApp().$axios
}
