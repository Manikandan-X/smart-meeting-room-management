import { apiClient } from './client'
import type { BookingHistory } from '@/types/models'
import type { BookingStatus } from '@/types/enums'

export interface BookingHistoryParams {
  user_id?: number
  meeting_room_id?: number
  status?: BookingStatus
  start_date?: string
  end_date?: string
}

export const reportsApi = {
  bookingHistory: async (
    params: BookingHistoryParams = {},
  ): Promise<BookingHistory[]> => {
    const { data } = await apiClient.get<
      BookingHistory[]
    >('/reports/booking-history', { params })
    return data
  },

  exportExcel: async (
    params: BookingHistoryParams = {},
  ): Promise<Blob> => {
    const { data } = await apiClient.get(
      '/reports/booking-history/export/excel',
      { params, responseType: 'blob' },
    )
    return data
  },

  exportPdf: async (
    params: BookingHistoryParams = {},
  ): Promise<Blob> => {
    const { data } = await apiClient.get(
      '/reports/booking-history/export/pdf',
      { params, responseType: 'blob' },
    )
    return data
  },
}
