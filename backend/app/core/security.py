from datetime import datetime, timedelta, timezone
from typing import Any
import hashlib
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
)


def hash_password(
    password: str,
) -> str:
    """
    Convert plain password into bcrypt hash.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify plain password against stored hash.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )
    
def generate_password_reset_token() -> str:
    """
    Generate a secure random password reset token.
    """

    return secrets.token_urlsafe(32)


def hash_password_reset_token(
    token: str,
) -> str:
    """
    Hash a password reset token before
    storing it in the database.
    """

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_access_token(
    data: dict[str, Any],
) -> str:
    """
    Create JWT access token.
    """

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode JWT access token.
    """

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[
                settings.algorithm,
            ],
        )

        return payload

    except JWTError:
        return {}