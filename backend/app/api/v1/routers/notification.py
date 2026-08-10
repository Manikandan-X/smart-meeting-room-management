from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.models.enums import NotificationType
from app.services.notification_service import NotificationService
from app.repositories.notification_repository import (
    NotificationRepository,
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_notification_service(
    db: Session = Depends(get_db),
) -> NotificationService:

    notification_repository = (
        NotificationRepository(db)
    )

    return NotificationService(
        notification_repository,
    )


@router.get(
    "",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
)
def get_my_notifications(
    notification_type: NotificationType | None = Query(
        default=None,
    ),
    is_read: bool | None = Query(
        default=None,
    ),
    booking_id: int | None = Query(
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
    current_user: User = Depends(
        get_current_user,
    ),
    notification_service: NotificationService = Depends(
        get_notification_service,
    ),
):
    return (
        notification_service
        .get_user_notifications(
            user_id=current_user.id,
            notification_type=notification_type,
            is_read=is_read,
            booking_id=booking_id,
            skip=skip,
            limit=limit,
        )
    )


@router.get(
    "/unread",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
)
def get_unread_notifications(
    current_user: User = Depends(
        get_current_user,
    ),
    notification_service: NotificationService = Depends(
        get_notification_service,
    ),
):
    return (
        notification_service
        .get_unread_notifications(
            user_id=current_user.id,
        )
    )


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
def get_notification(
    notification_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    notification_service: NotificationService = Depends(
        get_notification_service,
    ),
):
    notification = (
        notification_service
        .get_notification(
            notification_id,
        )
    )

    if (
        not notification
        or notification.user_id != current_user.id
    ):
        from app.core.exceptions import NotFoundException

        raise NotFoundException(
            "Notification",
        )

    return notification


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    notification_service: NotificationService = Depends(
        get_notification_service,
    ),
):
    notification = (
        notification_service
        .get_notification(
            notification_id,
        )
    )

    if (
        not notification
        or notification.user_id != current_user.id
    ):
        from app.core.exceptions import NotFoundException

        raise NotFoundException(
            "Notification",
        )

    return (
        notification_service
        .mark_as_read(
            notification_id,
        )
    )