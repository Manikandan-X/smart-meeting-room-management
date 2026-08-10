from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.meeting_room import MeetingRoom
    from app.models.resource import Resource


class RoomResource(Base, TimestampMixin):
    __tablename__ = "room_resources"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    meeting_room_id: Mapped[int] = mapped_column(
        ForeignKey("meeting_rooms.id"),
        nullable=False,
    )

    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    meeting_room: Mapped["MeetingRoom"] = relationship(
        "MeetingRoom",
        back_populates="room_resources",
    )

    resource: Mapped["Resource"] = relationship(
        "Resource",
        back_populates="room_resources",
    )

    def __repr__(self) -> str:
        return (
            f"<RoomResource(id={self.id}, "
            f"meeting_room_id={self.meeting_room_id}, "
            f"resource_id={self.resource_id})>"
        )