from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Manikandan"],
    )

    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["S"],
    )

    email: EmailStr = Field(
        ...,
        examples=["user@example.com"],
    )


    department_id: int = Field(
        ...,
        description="User department id",
    )


class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["Password@123"],
    )


class UserUpdate(BaseSchema):
    first_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    email: EmailStr | None = None

    department_id: int | None = None

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=128,
    )


class UserResponse(UserBase):
    id: int

    created_at: datetime
    updated_at: datetime