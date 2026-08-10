import { apiClient } from './client'
import type {
  MeResponse,
  RegisterPayload,
  TokenResponse,
  User,
} from '@/types/models'

export const authApi = {
  login: async (
    email: string,
    password: string,
  ): Promise<TokenResponse> => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const { data } = await apiClient.post<TokenResponse>(
      '/auth/login',
      form,
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      },
    )

    return data
  },

  register: async (
    payload: RegisterPayload,
  ): Promise<User> => {
    const { data } = await apiClient.post<User>(
      '/auth/register',
      payload,
    )

    return data
  },

  me: async (): Promise<MeResponse> => {
    const { data } = await apiClient.get<MeResponse>(
      '/auth/me',
    )

    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
