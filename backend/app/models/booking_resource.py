from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.resource import Resource


class BookingResource(Base, TimestampMixin):
    __tablename__ = "booking_resources"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id"),
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

    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="booking_resources",
    )

    resource: Mapped["Resource"] = relationship(
        "Resource",
    )

    def __repr__(self) -> str:
        return (
            f"<BookingResource("
            f"id={self.id}, "
            f"booking_id={self.booking_id}, "
            f"resource_id={self.resource_id}, "
            f"quantity={self.quantity})>"
        )