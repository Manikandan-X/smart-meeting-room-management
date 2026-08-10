from datetime import datetime

from pydantic import Field

from app.schemas.base import BaseSchema


class ResourceBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Projector"],
    )

    quantity: int = Field(
        ...,
        ge=1,
        examples=[5],
    )

    is_available: bool = Field(
        default=True,
    )


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseSchema):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    quantity: int | None = Field(
        default=None,
        ge=1,
    )

    is_available: bool | None = None


class ResourceResponse(ResourceBase):
    id: int

    created_at: datetime
    updated_at: datetime