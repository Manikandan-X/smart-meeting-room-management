from datetime import datetime

from app.models.enums import BookingStatus
from app.schemas.base import BaseSchema


class BookingHistoryResponse(BaseSchema):
    id: int
    user_id: int
    meeting_room_id: int
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    recurrence_id: int | None
    created_at: datetime
    updated_at: datetime