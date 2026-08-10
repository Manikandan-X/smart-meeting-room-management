import { apiClient } from './client'
import type { User, UserUpdatePayload } from '@/types/models'

export interface UserListParams {
  search?: string
  role_id?: number
  department_id?: number
  skip?: number
  limit?: number
}

export const usersApi = {
  list: async (
    params: UserListParams = {},
  ): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(
      '/users/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(
      `/users/${id}`,
    )
    return data
  },

  update: async (
    id: number,
    payload: UserUpdatePayload,
  ): Promise<User> => {
    const { data } = await apiClient.put<User>(
      `/users/${id}`,
      payload,
    )
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
