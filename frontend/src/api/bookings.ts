import { apiClient } from './client'
import type {
  Booking,
  BookingCreatePayload,
  BookingUpdatePayload,
} from '@/types/models'
import type { BookingStatus } from '@/types/enums'

export interface BookingListParams {
  search?: string
  status?: BookingStatus
  meeting_room_id?: number
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}

export const bookingsApi = {
  list: async (
    params: BookingListParams = {},
  ): Promise<Booking[]> => {
    const { data } = await apiClient.get<Booking[]>(
      '/bookings/',
      { params },
    )
    return data
  },

  get: async (id: number): Promise<Booking> => {
    const { data } = await apiClient.get<Booking>(
      `/bookings/${id}`,
    )
    return data
  },

  create: async (
    payload: BookingCreatePayload,
  ): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>(
      '/bookings/',
      payload,
    )
    return data
  },

  update: async (
    id: number,
    payload: BookingUpdatePayload,
  ): Promise<Booking> => {
    const { data } = await apiClient.put<Booking>(
      `/bookings/${id}`,
      payload,
    )
    return data
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`)
  },
}
