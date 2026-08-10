from datetime import datetime

from pydantic import Field

from app.models.enums import (
    BookingStatus,
    RecurrenceType,
)
from app.schemas.base import BaseSchema


class BookingResourceRequest(BaseSchema):
    resource_id: int = Field(
        ...,
        description="Resource ID",
        examples=[1],
    )

    quantity: int = Field(
        ...,
        ge=1,
        description="Required resource quantity",
        examples=[2],
    )


class BookingBase(BaseSchema):
    meeting_room_id: int = Field(
        ...,
        description="Meeting Room ID",
        examples=[1],
    )

    title: str = Field(
        ...,
        min_length=2,
        max_length=255,
        examples=["Sprint Planning"],
    )

    description: str | None = Field(
        default=None,
        examples=[
            "Weekly sprint planning meeting"
        ],
    )

    start_time: datetime = Field(
        ...,
        description="Meeting start date and time",
    )

    end_time: datetime = Field(
        ...,
        description="Meeting end date and time",
    )

    recurrence_type: RecurrenceType = Field(
        default=RecurrenceType.NONE,
        description="Recurring meeting type",
    )

    recurrence_end_date: datetime | None = Field(
        default=None,
        description=(
            "Last occurrence date for "
            "recurring meetings"
        ),
    )

    resources: list[BookingResourceRequest] = Field(
        default_factory=list,
        description="Resources required for this booking",
    )


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseSchema):
    meeting_room_id: int | None = None

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    description: str | None = None

    start_time: datetime | None = None

    end_time: datetime | None = None

    status: BookingStatus | None = None

    recurrence_type: RecurrenceType | None = None

    recurrence_end_date: datetime | None = None

    resources: list[BookingResourceRequest] | None = None


class BookingResourceResponse(BaseSchema):
    id: int

    resource_id: int

    quantity: int


class BookingResponse(BaseSchema):
    id: int

    user_id: int

    meeting_room_id: int

    title: str

    description: str | None

    start_time: datetime

    end_time: datetime

    recurrence_type: RecurrenceType

    recurrence_end_date: datetime | None

    recurrence_id: int | None

    status: BookingStatus

    resources: list[BookingResourceResponse] = Field(
        default_factory=list,
    )

    created_at: datetime

    updated_at: datetime

    created_at: datetime

    updated_at: datetime