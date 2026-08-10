from pydantic import Field

from app.schemas.base import BaseSchema


class TokenResponse(BaseSchema):
    access_token: str = Field(
        ...,
        description="JWT access token",
    )

    token_type: str = Field(
        default="bearer",
        examples=["bearer"],
    )


class TokenPayload(BaseSchema):
    sub: str = Field(
        ...,
        description="User email stored in JWT subject",
    )
    
class ChangePasswordRequest(BaseSchema):
    current_password: str = Field(
        min_length=8,
        max_length=128,
    )

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )
    
class ForgotPasswordRequest(BaseSchema):
    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
    )


class ResetPasswordRequest(BaseSchema):
    token: str = Field(
        ...,
        min_length=32,
        max_length=255,
    )

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )