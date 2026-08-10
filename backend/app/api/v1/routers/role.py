from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
)
from app.services.role_service import RoleService


router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
)


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = RoleService(db)

    return service.create_role(
        role_data,
        current_user.id,
    )


@router.get(
    "",
    response_model=list[RoleResponse],
)
def get_roles(
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
    current_user: User = Depends(get_current_user),
):
    service = RoleService(db)

    return service.get_roles(
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RoleService(db)

    return service.get_role(
        role_id
    )


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
)
def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = RoleService(db)

    return service.update_role(
        role_id,
        role_data,
        current_user.id,
    )