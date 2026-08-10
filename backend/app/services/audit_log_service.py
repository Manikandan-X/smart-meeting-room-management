from app.models.audit_log import AuditLog

from app.repositories.audit_log_repository import (
    AuditLogRepository,
)


class AuditLogService:

    def __init__(
        self,
        audit_log_repository: AuditLogRepository,
    ):
        self.audit_log_repository = (
            audit_log_repository
        )

    def create_audit_log(
        self,
        user_id: int | None,
        action: str,
        entity_type: str,
        entity_id: int | None,
        description: str,
    ) -> AuditLog:

        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description.strip(),
        )

        return (
            self.audit_log_repository
            .create_audit_log(
                audit_log,
            )
        )

    def get_audit_log(
        self,
        audit_log_id: int,
    ) -> AuditLog | None:

        return (
            self.audit_log_repository
            .get_audit_log_by_id(
                audit_log_id,
            )
        )

    def get_audit_logs(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[AuditLog]:

        return (
            self.audit_log_repository
            .get_audit_logs(
                skip=skip,
                limit=limit,
            )
        )

    def get_audit_logs_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> list[AuditLog]:

        return (
            self.audit_log_repository
            .get_audit_logs_by_user(
                user_id=user_id,
                skip=skip,
                limit=limit,
            )
        )