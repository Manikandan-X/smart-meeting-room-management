from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin
from app.db.session import get_db
from app.models.user import User

from app.repositories.audit_log_repository import (
    AuditLogRepository,
)

from app.services.audit_log_service import (
    AuditLogService,
)

from app.schemas.audit_log import (
    AuditLogResponse,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


def get_audit_log_service(
    db: Session = Depends(get_db),
) -> AuditLogService:

    repository = AuditLogRepository(db)

    return AuditLogService(
        repository,
    )


@router.get(
    "",
    response_model=list[AuditLogResponse],
)
def get_audit_logs(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(
        get_current_admin,
    ),
    audit_log_service: AuditLogService = Depends(
        get_audit_log_service,
    ),
):

    return audit_log_service.get_audit_logs(
        skip=skip,
        limit=limit,
    )