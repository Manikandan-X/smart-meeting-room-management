from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking_recurrence import (
    BookingRecurrence,
)


class BookingRecurrenceRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_recurrence(
        self,
        recurrence: BookingRecurrence,
    ) -> BookingRecurrence:

        self.db.add(
            recurrence,
        )

        self.db.commit()

        self.db.refresh(
            recurrence,
        )

        return recurrence

    def get_recurrence_by_id(
        self,
        recurrence_id: int,
    ) -> BookingRecurrence | None:

        statement = select(
            BookingRecurrence,
        ).where(
            BookingRecurrence.id == recurrence_id,
        )

        return self.db.scalar(
            statement,
        )

    def update_recurrence(
        self,
        recurrence: BookingRecurrence,
        update_data: dict,
    ) -> BookingRecurrence:

        for field, value in update_data.items():

            setattr(
                recurrence,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            recurrence,
        )

        return recurrence

    def delete_recurrence(
        self,
        recurrence: BookingRecurrence,
    ) -> None:

        self.db.delete(
            recurrence,
        )

        self.db.commit()