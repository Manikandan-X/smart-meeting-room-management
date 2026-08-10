from datetime import datetime

from pydantic import Field

from app.models.enums import NotificationType
from app.schemas.base import BaseSchema


class NotificationBase(BaseSchema):
    notification_type: NotificationType = Field(
        ...,
        description="Type of notification",
    )

    title: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )

    message: str = Field(
        ...,
        min_length=1,
    )


class NotificationCreate(NotificationBase):
    user_id: int

    booking_id: int | None = None

    scheduled_at: datetime | None = None


class NotificationResponse(NotificationBase):
    id: int

    user_id: int

    booking_id: int | None

    is_read: bool

    scheduled_at: datetime | None

    sent_at: datetime | None

    created_at: datetime

    updated_at: datetime