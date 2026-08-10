from pydantic import Field
from datetime import datetime

from app.schemas.base import BaseSchema


class DepartmentBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Department name",
        examples=["Information Technology"],
    )

    description: str | None = Field(
        default=None,
        max_length=255,
        description="Department description",
        examples=["Handles software development and IT infrastructure."],
    )


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseSchema):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=255,
    )


class DepartmentResponse(DepartmentBase):
    id: int

    created_at: datetime
    updated_at: datetime