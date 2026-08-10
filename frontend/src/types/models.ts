import type {
  BookingStatus,
  RecurrenceType,
  NotificationType,
} from './enums'

/* ---------- Auth ---------- */

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface MeResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  role_id: number
  role_name: string
  department_id: number
  department_name: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  department_id: number
  password: string
}

/* ---------- Role ---------- */

export interface Role {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface RoleCreatePayload {
  name: string
  description?: string | null
}

export interface RoleUpdatePayload {
  name?: string
  description?: string | null
}

/* ---------- Department ---------- */

export interface Department {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface DepartmentCreatePayload {
  name: string
  description?: string | null
}

export interface DepartmentUpdatePayload {
  name?: string
  description?: string | null
}

/* ---------- User ---------- */

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  department_id: number
  role_id: number
  role_name: string
  department_name: string
  created_at: string
  updated_at: string
}

export interface UserUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  department_id?: number
  role_id?: number
  password?: string
}

/* ---------- Meeting Room ---------- */

export interface MeetingRoom {
  id: number
  name: string
  capacity: number
  facilities: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface MeetingRoomCreatePayload {
  name: string
  capacity: number
  facilities: string
  is_available?: boolean
}

export interface MeetingRoomUpdatePayload {
  name?: string
  capacity?: number
  facilities?: string
  is_available?: boolean
}

/* ---------- Resource ---------- */

export interface Resource {
  id: number
  name: string
  quantity: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface ResourceCreatePayload {
  name: string
  quantity: number
  is_available?: boolean
}

export interface ResourceUpdatePayload {
  name?: string
  quantity?: number
  is_available?: boolean
}

/* ---------- Room Resource ---------- */

export interface RoomResource {
  id: number
  meeting_room_id: number
  resource_id: number
  quantity: number
  created_at: string
  updated_at: string
}

export interface RoomResourceCreatePayload {
  meeting_room_id: number
  resource_id: number
  quantity: number
}

export interface RoomResourceUpdatePayload {
  meeting_room_id?: number
  resource_id?: number
  quantity?: number
}

/* ---------- Booking ---------- */

export interface BookingResourceRequest {
  resource_id: number
  quantity: number
}

export interface BookingResourceResponse {
  id: number
  resource_id: number
  quantity: number
}

export interface Booking {
  id: number
  user_id: number
  meeting_room_id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  recurrence_type: RecurrenceType
  recurrence_end_date: string | null
  recurrence_id: number | null
  status: BookingStatus
  resources: BookingResourceResponse[]
  created_at: string
  updated_at: string
}

export interface BookingCreatePayload {
  meeting_room_id: number
  title: string
  description?: string | null
  start_time: string
  end_time: string
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string | null
  resources?: BookingResourceRequest[]
}

export interface BookingUpdatePayload {
  meeting_room_id?: number
  title?: string
  description?: string | null
  start_time?: string
  end_time?: string
  status?: BookingStatus
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string | null
  resources?: BookingResourceRequest[]
}

/* ---------- Notification ---------- */

export interface Notification {
  id: number
  user_id: number
  booking_id: number | null
  notification_type: NotificationType
  title: string
  message: string
  is_read: boolean
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

/* ---------- Dashboard ---------- */

export interface UpcomingMeeting {
  id: number
  user_id: number
  meeting_room_id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  status: BookingStatus
}

export interface AvailableRoom {
  id: number
  name: string
  capacity: number
  facilities: string
  is_available: boolean
}

export interface RoomUtilization {
  meeting_room_id: number
  room_name: string
  booked_minutes: number
  utilization_percentage: number
}

export interface ResourceUsage {
  resource_id: number
  resource_name: string
  total_quantity: number
  booked_quantity: number
  booking_count: number
}

export interface MonthlyBookingReport {
  month: string
  total_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
}

/* ---------- Reports ---------- */

export interface BookingHistory {
  id: number
  user_id: number
  meeting_room_id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  status: BookingStatus
  recurrence_id: number | null
  created_at: string
  updated_at: string
}

/* ---------- Audit Log ---------- */

export interface AuditLog {
  id: number
  user_id: number | null
  action: string
  entity_type: string
  entity_id: number | null
  description: string | null
  created_at: string
}
