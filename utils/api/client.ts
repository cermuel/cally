import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

export type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

export type ApiError = AxiosError<ApiErrorPayload>

export async function apiRequest<TData>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
) {
  const response = await client.request<TData>(config)

  return response.data
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const apiError = error as ApiError

  return apiError.response?.data?.message || apiError.message || fallback
}

export function getApiFieldErrors(error: unknown) {
  const apiError = error as ApiError

  return apiError.response?.data?.errors ?? {}
}
