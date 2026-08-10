from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User

from app.schemas.room_resource import (
    RoomResourceCreate,
    RoomResourceUpdate,
    RoomResourceResponse,
)

from app.services.room_resource_service import (
    RoomResourceService,
)


router = APIRouter(
    prefix="/room-resources",
    tags=["Room Resources"],
)


@router.post(
    "/",
    response_model=RoomResourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_room_resource(
    room_resource_data: RoomResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = RoomResourceService(db)

    return service.create_room_resource(
        room_resource_data,
        current_user.id,
    )


@router.get(
    "/",
    response_model=list[RoomResourceResponse],
)
def get_room_resources(
    meeting_room_id: int | None = Query(
        default=None,
        ge=1,
    ),
    resource_id: int | None = Query(
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
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = RoomResourceService(db)

    return service.get_room_resources(
        meeting_room_id=meeting_room_id,
        resource_id=resource_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{room_resource_id}",
    response_model=RoomResourceResponse,
)
def get_room_resource(
    room_resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RoomResourceService(db)

    return service.get_room_resource(
        room_resource_id,
    )


@router.put(
    "/{room_resource_id}",
    response_model=RoomResourceResponse,
)
def update_room_resource(
    room_resource_id: int,
    room_resource_data: RoomResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = RoomResourceService(db)

    return service.update_room_resource(
        room_resource_id,
        room_resource_data,
        current_user.id,
    )


@router.delete(
    "/{room_resource_id}",
    status_code=status.HTTP_200_OK,
)
def delete_room_resource(
    room_resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = RoomResourceService(db)

    return service.delete_room_resource(
        room_resource_id,
        current_user.id,
    )