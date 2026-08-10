import { apiClient } from './client'
import type {
  Department,
  DepartmentCreatePayload,
  DepartmentUpdatePayload,
} from '@/types/models'

export interface DepartmentListParams {
  search?: string
  skip?: number
  limit?: number
}

export const departmentsApi = {
  list: async (
    params: DepartmentListParams = {},
  ): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>(
      '/departments/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<Department> => {
    const { data } = await apiClient.get<Department>(
      `/departments/${id}`,
    )
    return data
  },

  create: async (
    payload: DepartmentCreatePayload,
  ): Promise<Department> => {
    const { data } = await apiClient.post<Department>(
      '/departments/',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: DepartmentUpdatePayload,
  ): Promise<Department> => {
    const { data } = await apiClient.put<Department>(
      `/departments/${id}`,
      payload,
    )
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`)
  },
}
