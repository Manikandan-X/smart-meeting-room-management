from datetime import datetime

from app.schemas.base import BaseSchema


class AuditLogResponse(BaseSchema):
    id: int

    user_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    description: str | None

    created_at: datetime