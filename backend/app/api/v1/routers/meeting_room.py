from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_room import (
    MeetingRoomCreate,
    MeetingRoomUpdate,
    MeetingRoomResponse,
)
from app.services.meeting_room_service import (
    MeetingRoomService,
)


router = APIRouter(
    prefix="/meeting-rooms",
    tags=["Meeting Rooms"],
)


@router.post(
    "/",
    response_model=MeetingRoomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting_room(
    meeting_room_data: MeetingRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = MeetingRoomService(db)

    return service.create_meeting_room(
        meeting_room_data,
        current_user.id,
    )


@router.get(
    "/",
    response_model=list[MeetingRoomResponse],
)
def get_meeting_rooms(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    is_available: bool | None = Query(
        default=None,
    ),
    min_capacity: int | None = Query(
        default=None,
        ge=1,
    ),
    max_capacity: int | None = Query(
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
    service = MeetingRoomService(db)

    return service.get_meeting_rooms(
        search=search,
        is_available=is_available,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{meeting_room_id}",
    response_model=MeetingRoomResponse,
)
def get_meeting_room(
    meeting_room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingRoomService(db)

    return service.get_meeting_room(
        meeting_room_id,
    )


@router.put(
    "/{meeting_room_id}",
    response_model=MeetingRoomResponse,
)
def update_meeting_room(
    meeting_room_id: int,
    meeting_room_data: MeetingRoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = MeetingRoomService(db)

    return service.update_meeting_room(
        meeting_room_id,
        meeting_room_data,
        current_user.id,
    )


@router.delete(
    "/{meeting_room_id}",
    status_code=status.HTTP_200_OK,
)
def delete_meeting_room(
    meeting_room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = MeetingRoomService(db)

    return service.delete_meeting_room(
        meeting_room_id,
        current_user.id,
    )