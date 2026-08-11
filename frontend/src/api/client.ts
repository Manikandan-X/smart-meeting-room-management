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
      const hadToken = Boolean(
        localStorage.getItem('access_token'),
      )

      localStorage.removeItem('access_token')

      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']

      // Only force a redirect when a session actually
      // expired (a token was present). If the person was
      // never logged in - e.g. browsing the public
      // register page - let the request's own error
      // handling take over instead of hijacking navigation.
      if (
        hadToken &&
        !publicPaths.includes(window.location.pathname)
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
