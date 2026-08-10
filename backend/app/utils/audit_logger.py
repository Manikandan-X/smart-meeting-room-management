from sqlalchemy.orm import Session

from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.services.audit_log_service import (
    AuditLogService,
)


from sqlalchemy.orm import Session

from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.services.audit_log_service import (
    AuditLogService,
)


def log_audit(
    db: Session,
    user_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None,
    description: str,
) -> None:

    repository = AuditLogRepository(db)

    service = AuditLogService(
        repository,
    )

    service.create_audit_log(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
    )

    db.commit()