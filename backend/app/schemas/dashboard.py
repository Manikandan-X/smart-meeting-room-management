from datetime import datetime

from app.models.enums import BookingStatus
from app.schemas.base import BaseSchema


class UpcomingMeetingResponse(BaseSchema):
    id: int
    user_id: int
    meeting_room_id: int
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    status: BookingStatus


class AvailableRoomResponse(BaseSchema):
    id: int
    name: str
    capacity: int
    facilities: str
    is_available: bool


class RoomUtilizationResponse(BaseSchema):
    meeting_room_id: int
    room_name: str
    booked_minutes: int
    utilization_percentage: float


class ResourceUsageResponse(BaseSchema):
    resource_id: int
    resource_name: str
    total_quantity: int
    booked_quantity: int
    booking_count: int
    
class MonthlyBookingReportResponse(BaseSchema):
    month: str
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int