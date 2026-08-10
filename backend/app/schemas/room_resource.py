from datetime import datetime

from pydantic import Field

from app.schemas.base import BaseSchema


class RoomResourceBase(BaseSchema):
    meeting_room_id: int = Field(
        ...,
        description="Meeting Room ID",
        examples=[1],
    )

    resource_id: int = Field(
        ...,
        description="Resource ID",
        examples=[2],
    )

    quantity: int = Field(
        ...,
        ge=1,
        description="Assigned resource quantity",
        examples=[2],
    )


class RoomResourceCreate(RoomResourceBase):
    pass


class RoomResourceUpdate(BaseSchema):
    meeting_room_id: int | None = None

    resource_id: int | None = None

    quantity: int | None = Field(
        default=None,
        ge=1,
    )


class RoomResourceResponse(RoomResourceBase):
    id: int

    created_at: datetime
    updated_at: datetime