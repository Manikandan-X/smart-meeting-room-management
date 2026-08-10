from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.department import Department
    from app.models.booking import Booking
    from app.models.notification import Notification
    from app.models.audit_log import AuditLog
    from app.models.password_reset_token import PasswordResetToken



class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"),
        nullable=False,
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    # Relationships

    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="users",
    )

    department: Mapped["Department"] = relationship(
        "Department",
        back_populates="users",
    )
    
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="user",
    )
    
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user",
    )
    
    notifications: Mapped[
        list["Notification"]
    ] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    password_reset_tokens: Mapped[
        list["PasswordResetToken"]
    ] = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<User(id={self.id}, "
            f"email='{self.email}')>"
        )