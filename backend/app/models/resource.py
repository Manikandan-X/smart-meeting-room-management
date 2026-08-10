from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.room_resource import RoomResource

class Resource(Base, TimestampMixin):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    room_resources: Mapped[list["RoomResource"]] = relationship(
        "RoomResource",
        back_populates="resource",
    )

    def __repr__(self) -> str:
        return (
            f"<Resource(id={self.id}, "
            f"name='{self.name}')>"
        )