import { apiClient } from './client'
import type {
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
} from '@/types/models'

export interface RoleListParams {
  skip?: number
  limit?: number
}

export const rolesApi = {
  list: async (
    params: RoleListParams = {},
  ): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>(
      '/roles',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<Role> => {
    const { data } = await apiClient.get<Role>(
      `/roles/${id}`,
    )
    return data
  },

  create: async (
    payload: RoleCreatePayload,
  ): Promise<Role> => {
    const { data } = await apiClient.post<Role>(
      '/roles',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: RoleUpdatePayload,
  ): Promise<Role> => {
    const { data } = await apiClient.put<Role>(
      `/roles/${id}`,
      payload,
    )
    return data
  },
}
