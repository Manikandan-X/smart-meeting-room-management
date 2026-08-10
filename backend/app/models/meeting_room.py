from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.room_resource import RoomResource
    from app.models.booking import Booking


class MeetingRoom(Base, TimestampMixin):
    __tablename__ = "meeting_rooms"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    facilities: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    room_resources: Mapped[list["RoomResource"]] = relationship(
        "RoomResource",
        back_populates="meeting_room",
    )
    
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="meeting_room",
    )

    def __repr__(self) -> str:
        return (
            f"<MeetingRoom(id={self.id}, "
            f"name='{self.name}')>"
        )