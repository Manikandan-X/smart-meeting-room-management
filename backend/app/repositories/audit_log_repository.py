from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_audit_log(
        self,
        audit_log: AuditLog,
    ) -> AuditLog:

        self.db.add(audit_log)

        self.db.flush()

        return audit_log

    def get_audit_log_by_id(
        self,
        audit_log_id: int,
    ) -> AuditLog | None:

        statement = select(
            AuditLog,
        ).where(
            AuditLog.id == audit_log_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_audit_logs(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[AuditLog]:

        statement = (
            select(
                AuditLog,
            )
            .order_by(
                AuditLog.created_at.desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def get_audit_logs_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> list[AuditLog]:

        statement = (
            select(
                AuditLog,
            )
            .where(
                AuditLog.user_id == user_id,
            )
            .order_by(
                AuditLog.created_at.desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )