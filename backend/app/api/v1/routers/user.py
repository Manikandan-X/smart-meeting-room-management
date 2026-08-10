from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin
from app.db.session import get_db

from app.schemas.user import (
    UserUpdate,
    UserResponse,
)
from app.services.user_service import UserService


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    service = UserService(db)

    return service.get_user(
        user_id
    )


@router.get(
    "/",
    response_model=list[UserResponse],
)
def get_users(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    role_id: int | None = Query(
        default=None,
        ge=1,
    ),
    department_id: int | None = Query(
        default=None,
        ge=1,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_admin
    ),
):

    service = UserService(db)

    return service.get_users(
        search=search,
        role_id=role_id,
        department_id=department_id,
        skip=skip,
        limit=limit,
    )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    service = UserService(db)

    return service.update_user(
        user_id,
        user_data,
        current_user.id,
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    service = UserService(db)

    return service.delete_user(
        user_id,
        current_user.id,
    )