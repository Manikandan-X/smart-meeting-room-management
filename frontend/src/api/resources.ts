import { apiClient } from './client'
import type {
  Resource,
  ResourceCreatePayload,
  ResourceUpdatePayload,
} from '@/types/models'

export interface ResourceListParams {
  search?: string
  is_available?: boolean
  skip?: number
  limit?: number
}

export const resourcesApi = {
  list: async (
    params: ResourceListParams = {},
  ): Promise<Resource[]> => {
    const { data } = await apiClient.get<Resource[]>(
      '/resources/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<Resource> => {
    const { data } = await apiClient.get<Resource>(
      `/resources/${id}`,
    )
    return data
  },

  create: async (
    payload: ResourceCreatePayload,
  ): Promise<Resource> => {
    const { data } = await apiClient.post<Resource>(
      '/resources/',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: ResourceUpdatePayload,
  ): Promise<Resource> => {
    const { data } = await apiClient.put<Resource>(
      `/resources/${id}`,
      payload,
    )
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/resources/${id}`)
  },
}
