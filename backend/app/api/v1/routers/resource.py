from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)
from app.services.resource_service import (
    ResourceService,
)


router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)


@router.post(
    "/",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = ResourceService(db)

    return service.create_resource(
        resource_data,
        current_user.id,
    )


@router.get(
    "/",
    response_model=list[ResourceResponse],
)
def get_resources(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    is_available: bool | None = Query(
        default=None,
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
    current_user: User = Depends(
        get_current_user,
    ),
):
    service = ResourceService(db)

    return service.get_resources(
        search=search,
        is_available=is_available,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)

    return service.get_resource(
        resource_id,
    )


@router.put(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = ResourceService(db)

    return service.update_resource(
        resource_id,
        resource_data,
        current_user.id,
    )


@router.delete(
    "/{resource_id}",
    status_code=status.HTTP_200_OK,
)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = ResourceService(db)

    return service.delete_resource(
        resource_id,
        current_user.id,
    )