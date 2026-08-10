from datetime import datetime

from pydantic import Field

from app.schemas.base import BaseSchema


class RoleBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Role name",
        examples=["Admin"],
    )

    description: str | None = Field(
        default=None,
        max_length=255,
        description="Role description",
        examples=["System Administrator"],
    )


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseSchema):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
        description="Role name",
        examples=["Admin"],
    )

    description: str | None = Field(
        default=None,
        max_length=255,
        description="Role description",
        examples=["System Administrator"],
    )


class RoleResponse(RoleBase):
    id: int

    created_at: datetime
    updated_at: datetime
