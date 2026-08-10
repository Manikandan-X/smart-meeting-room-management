from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.enums import BookingStatus

from app.core.dependencies import (
    get_current_user,
)
from app.db.session import get_db

from app.models.user import User

from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
)

from app.services.booking_service import (
    BookingService,
)


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = BookingService(
        db,
    )

    return service.create_booking(
        current_user.id,
        booking_data,
    )


@router.get(
    "/",
    response_model=list[BookingResponse],
)
def get_bookings(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    status: BookingStatus | None = Query(
        default=None,
    ),
    meeting_room_id: int | None = Query(
        default=None,
        ge=1,
    ),
    start_date: datetime | None = Query(
        default=None,
    ),
    end_date: datetime | None = Query(
        default=None,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=200,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = BookingService(db)

    return service.get_bookings(
        current_user=current_user,
        search=search,
        status=status,
        meeting_room_id=meeting_room_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = BookingService(
        db,
    )

    return service.get_booking(
        booking_id,
    )


@router.put(
    "/{booking_id}",
    response_model=BookingResponse,
)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = BookingService(
        db,
    )

    return service.update_booking(
        booking_id,
        booking_data,
        current_user,
    )


@router.delete(
    "/{booking_id}",
    status_code=status.HTTP_200_OK,
)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = BookingService(
        db,
    )

    return service.delete_booking(
        booking_id,
        current_user,
    )