from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import RecurrenceType
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.booking import Booking


class BookingRecurrence(Base, TimestampMixin):
    __tablename__ = "booking_recurrences"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    recurrence_type: Mapped[RecurrenceType] = mapped_column(
        Enum(RecurrenceType),
        nullable=False,
    )

    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="recurrence",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<BookingRecurrence("
            f"id={self.id}, "
            f"type={self.recurrence_type.value})>"
        )