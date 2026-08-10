from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
from app.models.enums import (
    BookingStatus,
    RecurrenceType,
)
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.meeting_room import MeetingRoom
    from app.models.booking_recurrence import BookingRecurrence
    from app.models.booking_resource import BookingResource
    from app.models.notification import Notification


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    meeting_room_id: Mapped[int] = mapped_column(
        ForeignKey("meeting_rooms.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus),
        default=BookingStatus.CONFIRMED,
        nullable=False,
    )
    
    recurrence_id: Mapped[int | None] = mapped_column(
        ForeignKey("booking_recurrences.id"),
        nullable=True,
    )
    
    user: Mapped["User"] = relationship(
        "User",
        back_populates="bookings",
    )

    meeting_room: Mapped["MeetingRoom"] = relationship(
        "MeetingRoom",
        back_populates="bookings",
    )
    
    recurrence: Mapped["BookingRecurrence | None"] = relationship(
        "BookingRecurrence",
        back_populates="bookings",
    )
    
    booking_resources: Mapped[list["BookingResource"]] = relationship(
        "BookingResource",
        back_populates="booking",
        cascade="all, delete-orphan",
    )
    
    notifications: Mapped[
        list["Notification"]
    ] = relationship(
        "Notification",
        back_populates="booking",
        cascade="all, delete-orphan",
    )
    
    @property
    def resources(self):
        return self.booking_resources
    
    @property
    def recurrence_type(self):
        if self.recurrence:
            return self.recurrence.recurrence_type

        return RecurrenceType.NONE


    @property
    def recurrence_end_date(self):
        if self.recurrence:
            return self.recurrence.end_date

        return None

    def __repr__(self) -> str:
        return (
            f"<Booking(id={self.id}, "
            f"title='{self.title}')>"
        )