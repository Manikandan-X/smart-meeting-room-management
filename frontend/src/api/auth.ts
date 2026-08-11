import { apiClient } from './client'
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  MeResponse,
  RegisterPayload,
  ResetPasswordPayload,
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

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(
      '/auth/change-password',
      payload,
    )
    return data
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      payload,
    )
    return data
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      payload,
    )
    return data
  },
}
