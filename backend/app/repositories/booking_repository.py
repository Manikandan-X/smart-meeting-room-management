from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus


class BookingRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_booking(
        self,
        booking: Booking,
    ) -> Booking:

        self.db.add(
            booking,
        )

        self.db.commit()

        self.db.refresh(
            booking,
        )

        return booking

    def create_bookings(
        self,
        bookings: list[Booking],
    ) -> list[Booking]:

        self.db.add_all(
            bookings,
        )

        self.db.commit()

        for booking in bookings:
            self.db.refresh(
                booking,
            )

        return bookings

    def get_booking_by_id(
        self,
        booking_id: int,
    ) -> Booking | None:

        statement = select(
            Booking,
        ).where(
            Booking.id == booking_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_bookings(
        self,
        search: str | None = None,
        status: BookingStatus | None = None,
        meeting_room_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Booking]:

        statement = select(
            Booking,
        )

        if user_id is not None:
            statement = statement.where(
                Booking.user_id == user_id
            )

        if search:
            statement = statement.where(
                Booking.title.ilike(
                    f"%{search.strip()}%"
                )
            )

        if status is not None:
            statement = statement.where(
                Booking.status == status
            )

        if meeting_room_id is not None:
            statement = statement.where(
                Booking.meeting_room_id
                == meeting_room_id
            )

        if start_date is not None:
            statement = statement.where(
                Booking.start_time >= start_date
            )

        if end_date is not None:
            statement = statement.where(
                Booking.start_time <= end_date
            )

        statement = (
            statement
            .order_by(
                Booking.start_time.asc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )
        
    def get_room_conflict(
        self,
        meeting_room_id: int,
        start_time: datetime,
        end_time: datetime,
    ) -> Booking | None:

        statement = select(
            Booking,
        ).where(
            and_(
                Booking.meeting_room_id
                == meeting_room_id,
                Booking.status
                != BookingStatus.CANCELLED,
                Booking.start_time
                < end_time,
                Booking.end_time
                > start_time,
            )
        )

        return self.db.scalar(
            statement,
        )

    def get_room_conflict_excluding_booking(
        self,
        booking_id: int,
        meeting_room_id: int,
        start_time: datetime,
        end_time: datetime,
    ) -> Booking | None:

        statement = select(
            Booking,
        ).where(
            and_(
                Booking.id != booking_id,
                Booking.meeting_room_id
                == meeting_room_id,
                Booking.status
                != BookingStatus.CANCELLED,
                Booking.start_time
                < end_time,
                Booking.end_time
                > start_time,
            )
        )

        return self.db.scalar(
            statement,
        )

    def get_bookings_by_recurrence(
        self,
        recurrence_id: int,
    ) -> list[Booking]:

        statement = select(
            Booking,
        ).where(
            Booking.recurrence_id
            == recurrence_id,
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )
        
    def get_resource_booking_conflicts(
        self,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: int | None = None,
    ) -> list[Booking]:

        conditions = [
            Booking.status != BookingStatus.CANCELLED,
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        ]

        if exclude_booking_id is not None:
            conditions.append(
                Booking.id != exclude_booking_id
            )

        statement = select(
            Booking,
        ).where(
            and_(
                *conditions,
            )
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )
        
    def create_booking_without_commit(
        self,
        booking: Booking,
    ) -> Booking:

        self.db.add(
            booking,
        )

        self.db.flush()

        return booking

    def update_booking(
        self,
        booking: Booking,
        update_data: dict,
    ) -> Booking:

        for field, value in update_data.items():

            setattr(
                booking,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            booking,
        )

        return booking

    def delete_booking(
        self,
        booking: Booking,
    ) -> None:

        self.db.delete(
            booking,
        )

        self.db.commit()