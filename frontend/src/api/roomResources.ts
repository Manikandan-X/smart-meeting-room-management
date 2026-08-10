import { apiClient } from './client'
import type {
  RoomResource,
  RoomResourceCreatePayload,
  RoomResourceUpdatePayload,
} from '@/types/models'

export interface RoomResourceListParams {
  meeting_room_id?: number
  resource_id?: number
  skip?: number
  limit?: number
}

export const roomResourcesApi = {
  list: async (
    params: RoomResourceListParams = {},
  ): Promise<RoomResource[]> => {
    const { data } = await apiClient.get<RoomResource[]>(
      '/room-resources/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<RoomResource> => {
    const { data } = await apiClient.get<RoomResource>(
      `/room-resources/${id}`,
    )
    return data
  },

  create: async (
    payload: RoomResourceCreatePayload,
  ): Promise<RoomResource> => {
    const { data } = await apiClient.post<RoomResource>(
      '/room-resources/',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: RoomResourceUpdatePayload,
  ): Promise<RoomResource> => {
    const { data } = await apiClient.put<RoomResource>(
      `/room-resources/${id}`,
      payload,
    )
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/room-resources/${id}`)
  },
}
