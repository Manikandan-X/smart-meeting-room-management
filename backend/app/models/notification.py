from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import NotificationType
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.booking import Booking


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("bookings.id"),
        nullable=True,
    )

    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    is_read: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    scheduled_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    sent_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
    )

    booking: Mapped["Booking | None"] = relationship(
        "Booking",
        back_populates="notifications",
    )

    def __repr__(self) -> str:
        return (
            f"<Notification("
            f"id={self.id}, "
            f"type={self.notification_type.value})>"
        )