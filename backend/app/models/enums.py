from enum import Enum


class BookingStatus(str, Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"


class RecurrenceType(str, Enum):
    NONE = "None"
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    
class NotificationType(str, Enum):
    BOOKING_CONFIRMATION = "Booking Confirmation"
    MEETING_REMINDER = "Meeting Reminder"
    BOOKING_CANCELLATION = "Booking Cancellation"