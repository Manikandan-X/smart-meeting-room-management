from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.repositories.notification_repository import (
    NotificationRepository,
)
from app.services.notification_service import (
    NotificationService,
)


scheduler = BackgroundScheduler()


def process_notification_reminders() -> None:
    db: Session = SessionLocal()

    try:
        notification_repository = (
            NotificationRepository(db)
        )

        notification_service = NotificationService(
            notification_repository,
        )

        notification_service.send_pending_reminders()

    finally:
        db.close()


def start_notification_scheduler() -> None:

    if scheduler.running:
        return

    scheduler.add_job(
        process_notification_reminders,
        trigger="interval",
        minutes=1,
        id="notification_reminder_job",
        replace_existing=True,
    )

    scheduler.start()


def stop_notification_scheduler() -> None:

    if scheduler.running:
        scheduler.shutdown(
            wait=False,
        )