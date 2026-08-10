import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')

      if (
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      const first = detail[0]

      if (first?.msg) {
        return first.msg as string
      }
    }

    if (error.message) {
      return error.message
    }
  }

  return fallback
}
