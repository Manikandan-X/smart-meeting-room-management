from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    entity_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    user: Mapped["User | None"] = relationship(
        "User",
        back_populates="audit_logs",
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"action='{self.action}', "
            f"entity_type='{self.entity_type}', "
            f"entity_id={self.entity_id})>"
        )