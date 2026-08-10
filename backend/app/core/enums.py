from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Admin"
    EMPLOYEE = "Employee"


class BookingStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class NotificationType(str, Enum):
    BOOKING_CREATED = "BOOKING_CREATED"
    BOOKING_REMINDER = "BOOKING_REMINDER"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"