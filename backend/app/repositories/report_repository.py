from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus


class ReportRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_booking_history(
        self,
        user_id: int | None = None,
        meeting_room_id: int | None = None,
        status: BookingStatus | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[Booking]:

        conditions = []

        if user_id is not None:
            conditions.append(
                Booking.user_id == user_id
            )

        if meeting_room_id is not None:
            conditions.append(
                Booking.meeting_room_id
                == meeting_room_id
            )

        if status is not None:
            conditions.append(
                Booking.status == status
            )

        if start_date is not None:
            conditions.append(
                Booking.start_time >= start_date
            )

        if end_date is not None:
            conditions.append(
                Booking.start_time <= end_date
            )

        statement = (
            select(Booking)
            .where(
                and_(*conditions)
            )
            .order_by(
                Booking.start_time.desc()
            )
        )

        return list(
            self.db.scalars(
                statement
            ).all()
        )