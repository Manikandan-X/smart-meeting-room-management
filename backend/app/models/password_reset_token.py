from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class PasswordResetToken(Base, TimestampMixin):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    token_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="password_reset_tokens",
    )

    def __repr__(self) -> str:
        return (
            f"<PasswordResetToken("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"expires_at={self.expires_at}, "
            f"used_at={self.used_at})>"
        )