export const BookingStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
} as const

export type BookingStatus =
  (typeof BookingStatus)[keyof typeof BookingStatus]

export const RecurrenceType = {
  NONE: 'None',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
} as const

export type RecurrenceType =
  (typeof RecurrenceType)[keyof typeof RecurrenceType]

export const NotificationType = {
  BOOKING_CONFIRMATION: 'Booking Confirmation',
  MEETING_REMINDER: 'Meeting Reminder',
  BOOKING_CANCELLATION: 'Booking Cancellation',
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

export const UserRoleName = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
} as const

export type UserRoleName =
  (typeof UserRoleName)[keyof typeof UserRoleName]
