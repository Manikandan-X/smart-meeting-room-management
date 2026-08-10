import { apiClient } from './client'
import type {
  AvailableRoom,
  MonthlyBookingReport,
  ResourceUsage,
  RoomUtilization,
  UpcomingMeeting,
} from '@/types/models'

export const dashboardApi = {
  upcomingMeetings: async (
    limit = 10,
  ): Promise<UpcomingMeeting[]> => {
    const { data } = await apiClient.get<
      UpcomingMeeting[]
    >('/dashboard/upcoming-meetings', {
      params: { limit },
    })
    return data
  },

  availableRooms: async (): Promise<AvailableRoom[]> => {
    const { data } = await apiClient.get<
      AvailableRoom[]
    >('/dashboard/available-rooms')
    return data
  },

  roomUtilization: async (
    startDate: string,
    endDate: string,
  ): Promise<RoomUtilization[]> => {
    const { data } = await apiClient.get<
      RoomUtilization[]
    >('/dashboard/room-utilization', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
    return data
  },

  resourceUsage: async (
    startDate: string,
    endDate: string,
  ): Promise<ResourceUsage[]> => {
    const { data } = await apiClient.get<
      ResourceUsage[]
    >('/dashboard/resource-usage', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
    return data
  },

  monthlyBookingReport: async (
    year: number,
    month: number,
  ): Promise<MonthlyBookingReport> => {
    const { data } =
      await apiClient.get<MonthlyBookingReport>(
        '/dashboard/monthly-booking-report',
        { params: { year, month } },
      )
    return data
  },
}
