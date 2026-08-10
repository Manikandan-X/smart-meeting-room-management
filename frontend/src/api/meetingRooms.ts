import { apiClient } from './client'
import type {
  MeetingRoom,
  MeetingRoomCreatePayload,
  MeetingRoomUpdatePayload,
} from '@/types/models'

export interface MeetingRoomListParams {
  search?: string
  is_available?: boolean
  min_capacity?: number
  max_capacity?: number
  skip?: number
  limit?: number
}

export const meetingRoomsApi = {
  list: async (
    params: MeetingRoomListParams = {},
  ): Promise<MeetingRoom[]> => {
    const { data } = await apiClient.get<MeetingRoom[]>(
      '/meeting-rooms/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<MeetingRoom> => {
    const { data } = await apiClient.get<MeetingRoom>(
      `/meeting-rooms/${id}`,
    )
    return data
  },

  create: async (
    payload: MeetingRoomCreatePayload,
  ): Promise<MeetingRoom> => {
    const { data } = await apiClient.post<MeetingRoom>(
      '/meeting-rooms/',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: MeetingRoomUpdatePayload,
  ): Promise<MeetingRoom> => {
    const { data } = await apiClient.put<MeetingRoom>(
      `/meeting-rooms/${id}`,
      payload,
    )
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/meeting-rooms/${id}`)
  },
}
