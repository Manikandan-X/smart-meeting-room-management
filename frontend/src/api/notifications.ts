import { apiClient } from './client'
import type { Notification } from '@/types/models'
import type { NotificationType } from '@/types/enums'

export interface NotificationListParams {
  notification_type?: NotificationType
  is_read?: boolean
  booking_id?: number
  skip?: number
  limit?: number
}

export const notificationsApi = {
  list: async (
    params: NotificationListParams = {},
  ): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      '/notifications',
      { params },
    )
    return data
  },

  unread: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      '/notifications/unread',
    )
    return data
  },

  get: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.get<Notification>(
      `/notifications/${id}`,
    )
    return data
  },

  markAsRead: async (
    id: number,
  ): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(
      `/notifications/${id}/read`,
    )
    return data
  },
}
