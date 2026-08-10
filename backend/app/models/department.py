from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.user import User



class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="department",
    )

    def __repr__(self) -> str:
        return (
            f"<Department(id={self.id}, "
            f"name='{self.name}')>"
        )