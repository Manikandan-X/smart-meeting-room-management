from datetime import datetime

from pydantic import Field

from app.schemas.base import BaseSchema


class MeetingRoomBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Conference Room A"],
    )

    capacity: int = Field(
        ...,
        ge=1,
        examples=[10],
    )

    facilities: str = Field(
        ...,
        max_length=255,
        examples=["Projector, TV, Whiteboard"],
    )

    is_available: bool = Field(
        default=True,
    )


class MeetingRoomCreate(MeetingRoomBase):
    pass


class MeetingRoomUpdate(BaseSchema):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    capacity: int | None = Field(
        default=None,
        ge=1,
    )

    facilities: str | None = Field(
        default=None,
        max_length=255,
    )

    is_available: bool | None = None


class MeetingRoomResponse(MeetingRoomBase):
    id: int

    created_at: datetime
    updated_at: datetime