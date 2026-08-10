from fastapi import Depends
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    PermissionDeniedException,
)
from app.core.security import (
    decode_access_token,
    oauth2_scheme,
)
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Get authenticated user from JWT token.
    """

    try:
        payload = decode_access_token(
            token,
        )

        email = payload.get("sub")

        if email is None:
            raise PermissionDeniedException()

    except JWTError:
        raise PermissionDeniedException()

    repository = UserRepository(db)

    user = repository.get_user_by_email(
        email,
    )

    if not user:
        raise PermissionDeniedException()

    return user


def get_current_admin(
    current_user: User = Depends(
        get_current_user,
    ),
) -> User:
    """
    Allow only Admin users.
    """

    if current_user.role.name != "Admin":
        raise PermissionDeniedException()

    return current_user