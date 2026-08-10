from datetime import datetime
from sqlalchemy import select
from sqlalchemy import and_
from sqlalchemy.orm import Session
from app.models.enums import NotificationType
from app.models.notification import Notification


class NotificationRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_notification(
        self,
        notification: Notification,
    ) -> Notification:

        self.db.add(
            notification,
        )

        self.db.commit()

        self.db.refresh(
            notification,
        )

        return notification

    def get_notification_by_id(
        self,
        notification_id: int,
    ) -> Notification | None:

        statement = select(
            Notification,
        ).where(
            Notification.id == notification_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_user_notifications(
        self,
        user_id: int,
        notification_type: NotificationType | None = None,
        is_read: bool | None = None,
        booking_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Notification]:

        conditions = [
            Notification.user_id == user_id,
        ]

        if notification_type is not None:
            conditions.append(
                Notification.notification_type
                == notification_type
            )

        if is_read is not None:
            conditions.append(
                Notification.is_read == is_read
            )

        if booking_id is not None:
            conditions.append(
                Notification.booking_id
                == booking_id
            )

        statement = (
            select(Notification)
            .where(and_(*conditions))
            .order_by(
                Notification.created_at.desc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(statement).all()
        )

    def get_unread_notifications(
        self,
        user_id: int,
    ) -> list[Notification]:

        statement = (
            select(
                Notification,
            )
            .where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .order_by(
                Notification.created_at.desc(),
            )
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def update_notification(
        self,
        notification: Notification,
        update_data: dict,
    ) -> Notification:

        for field, value in update_data.items():

            setattr(
                notification,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            notification,
        )

        return notification

    def delete_notification(
        self,
        notification: Notification,
    ) -> None:

        self.db.delete(
            notification,
        )

        self.db.commit()
        
    def get_pending_reminders(
        self,
        current_time: datetime,
    ) -> list[Notification]:

        statement = (
            select(
                Notification,
            )
            .where(
                Notification.notification_type
                == NotificationType.MEETING_REMINDER,
                Notification.scheduled_at
                <= current_time,
                Notification.sent_at.is_(None),
            )
            .order_by(
                Notification.scheduled_at.asc(),
            )
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )