from datetime import datetime, timezone, timedelta

from app.models.notification import Notification
from app.models.enums import NotificationType
from app.repositories.notification_repository import (
    NotificationRepository,
)
from app.schemas.notification import (
    NotificationCreate,
)


class NotificationService:
    def __init__(
        self,
        notification_repository: NotificationRepository,
    ):
        self.notification_repository = (
            notification_repository
        )

    def create_notification(
        self,
        notification_data: NotificationCreate,
    ) -> Notification:

        notification = Notification(
            user_id=notification_data.user_id,
            booking_id=notification_data.booking_id,
            notification_type=(
                notification_data.notification_type
            ),
            title=notification_data.title.strip(),
            message=notification_data.message.strip(),
            scheduled_at=(
                notification_data.scheduled_at
            ),
            is_read=False,
        )

        return (
            self.notification_repository
            .create_notification(
                notification,
            )
        )

    def create_booking_confirmation(
        self,
        user_id: int,
        booking_id: int,
    ) -> Notification:

        notification = Notification(
            user_id=user_id,
            booking_id=booking_id,
            notification_type=(
                NotificationType.BOOKING_CONFIRMATION
            ),
            title="Booking Confirmed",
            message=(
                "Your meeting room booking "
                "has been confirmed."
            ),
            is_read=False,
            sent_at=datetime.now(
                timezone.utc,
            ),
        )

        return (
            self.notification_repository
            .create_notification(
                notification,
            )
        )

    def create_booking_cancellation(
        self,
        user_id: int,
        booking_id: int,
    ) -> Notification:

        notification = Notification(
            user_id=user_id,
            booking_id=booking_id,
            notification_type=(
                NotificationType.BOOKING_CANCELLATION
            ),
            title="Booking Cancelled",
            message=(
                "Your meeting room booking "
                "has been cancelled."
            ),
            is_read=False,
            sent_at=datetime.now(
                timezone.utc,
            ),
        )

        return (
            self.notification_repository
            .create_notification(
                notification,
            )
        )

    def create_meeting_reminder(
        self,
        user_id: int,
        booking_id: int,
        scheduled_at: datetime,
    ) -> Notification:

        notification = Notification(
            user_id=user_id,
            booking_id=booking_id,
            notification_type=(
                NotificationType.MEETING_REMINDER
            ),
            title="Meeting Reminder",
            message=(
                "Your meeting will start in 30 minutes."
            ),
            is_read=False,
            scheduled_at=scheduled_at,
            sent_at=None,
        )

        return (
            self.notification_repository
            .create_notification(
                notification,
            )
        )
        
    def schedule_meeting_reminder(
        self,
        user_id: int,
        booking_id: int,
        meeting_start_time: datetime,
    ) -> Notification:

        reminder_time = (
            meeting_start_time
            - timedelta(minutes=30)
        )

        return self.create_meeting_reminder(
            user_id=user_id,
            booking_id=booking_id,
            scheduled_at=reminder_time,
        )
        
    def send_pending_reminders(
        self,
    ) -> list[Notification]:

        current_time = datetime.now(
            timezone.utc,
        )

        notifications = (
            self.notification_repository
            .get_pending_reminders(
                current_time,
            )
        )

        sent_notifications = []

        for notification in notifications:

            notification.sent_at = current_time

            sent_notifications.append(
                notification
            )

        self.notification_repository.db.commit()

        return sent_notifications

    def get_notification(
        self,
        notification_id: int,
    ) -> Notification | None:

        return (
            self.notification_repository
            .get_notification_by_id(
                notification_id,
            )
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

        return (
            self.notification_repository
            .get_user_notifications(
                user_id=user_id,
                notification_type=notification_type,
                is_read=is_read,
                booking_id=booking_id,
                skip=skip,
                limit=limit,
            )
        )

    def get_unread_notifications(
        self,
        user_id: int,
    ) -> list[Notification]:

        return (
            self.notification_repository
            .get_unread_notifications(
                user_id,
            )
        )

    def mark_as_read(
        self,
        notification_id: int,
    ) -> Notification | None:

        notification = (
            self.notification_repository
            .get_notification_by_id(
                notification_id,
            )
        )

        if not notification:
            return None

        return (
            self.notification_repository
            .update_notification(
                notification,
                {
                    "is_read": True,
                },
            )
        )

    def delete_notification(
        self,
        notification_id: int,
    ) -> bool:

        notification = (
            self.notification_repository
            .get_notification_by_id(
                notification_id,
            )
        )

        if not notification:
            return False

        self.notification_repository.delete_notification(
            notification,
        )

        return True