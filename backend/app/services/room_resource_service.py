from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.core.messages import (
    DELETED_SUCCESS,
)
from app.models.room_resource import RoomResource

from app.repositories.meeting_room_repository import (
    MeetingRoomRepository,
)
from app.repositories.resource_repository import (
    ResourceRepository,
)
from app.repositories.room_resource_repository import (
    RoomResourceRepository,
)

from app.schemas.room_resource import (
    RoomResourceCreate,
    RoomResourceUpdate,
)
from app.utils.audit_logger import log_audit


class RoomResourceService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = RoomResourceRepository(
            db,
        )

        self.meeting_room_repository = (
            MeetingRoomRepository(db)
        )

        self.resource_repository = (
            ResourceRepository(db)
        )

    def create_room_resource(
        self,
        room_resource_data: RoomResourceCreate,
        user_id: int,
    ) -> RoomResource:

        meeting_room = (
            self.meeting_room_repository.get_meeting_room_by_id(
                room_resource_data.meeting_room_id,
            )
        )

        if not meeting_room:
            raise NotFoundException(
                "Meeting Room",
            )

        resource = (
            self.resource_repository.get_resource_by_id(
                room_resource_data.resource_id,
            )
        )

        if not resource:
            raise NotFoundException(
                "Resource",
            )

        if not resource.is_available:
            raise AlreadyExistsException(
                "Resource is not available",
            )

        existing = (
            self.repository.get_room_resource(
                room_resource_data.meeting_room_id,
                room_resource_data.resource_id,
            )
        )

        if existing:
            raise AlreadyExistsException(
                "Resource already assigned to this meeting room",
            )

        if (
            room_resource_data.quantity
            > resource.quantity
        ):
            raise AlreadyExistsException(
                "Assigned quantity exceeds available resource quantity",
            )

        room_resource = RoomResource(
            meeting_room_id=room_resource_data.meeting_room_id,
            resource_id=room_resource_data.resource_id,
            quantity=room_resource_data.quantity,
        )

        room_resource = self.repository.create_room_resource(
            room_resource,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="CREATE",
            entity_type="RoomResource",
            entity_id=room_resource.id,
            description=(
                f"Assigned resource "
                f"'{resource.name}' to meeting room "
                f"'{meeting_room.name}'"
            ),
        )

        return room_resource

    def get_room_resource(
        self,
        room_resource_id: int,
    ) -> RoomResource:

        room_resource = (
            self.repository.get_room_resource_by_id(
                room_resource_id,
            )
        )

        if not room_resource:
            raise NotFoundException(
                "Room Resource",
            )

        return room_resource

    def get_room_resources(
        self,
        meeting_room_id: int | None = None,
        resource_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[RoomResource]:

        return self.repository.get_room_resources(
            meeting_room_id=meeting_room_id,
            resource_id=resource_id,
            skip=skip,
            limit=limit,
        )

    def update_room_resource(
        self,
        room_resource_id: int,
        room_resource_data: RoomResourceUpdate,
        user_id: int,
    ) -> RoomResource:

        room_resource = (
            self.repository.get_room_resource_by_id(
                room_resource_id,
            )
        )

        if not room_resource:
            raise NotFoundException(
                "Room Resource",
            )

        update_data = room_resource_data.model_dump(
            exclude_unset=True,
        )

        if (
            "meeting_room_id"
            in update_data
        ):

            meeting_room = (
                self.meeting_room_repository.get_meeting_room_by_id(
                    update_data["meeting_room_id"],
                )
            )

            if not meeting_room:
                raise NotFoundException(
                    "Meeting Room",
                )

        if (
            "resource_id"
            in update_data
        ):

            resource = (
                self.resource_repository.get_resource_by_id(
                    update_data["resource_id"],
                )
            )

            if not resource:
                raise NotFoundException(
                    "Resource",
                )

            if not resource.is_available:
                raise AlreadyExistsException(
                    "Resource is not available",
                )

        resource_id = update_data.get(
            "resource_id",
            room_resource.resource_id,
        )

        meeting_room_id = update_data.get(
            "meeting_room_id",
            room_resource.meeting_room_id,
        )

        existing = (
            self.repository.get_room_resource(
                meeting_room_id,
                resource_id,
            )
        )

        if (
            existing
            and existing.id != room_resource.id
        ):
            raise AlreadyExistsException(
                "Resource already assigned to this meeting room",
            )

        if "quantity" in update_data:

            resource = (
                self.resource_repository.get_resource_by_id(
                    resource_id,
                )
            )

            if not resource:
                raise NotFoundException(
                    "Resource",
                )

            if (
                update_data["quantity"]
                > resource.quantity
            ):
                raise AlreadyExistsException(
                    "Assigned quantity exceeds available resource quantity",
                )
        room_resource = self.repository.update_room_resource(
            room_resource,
            update_data,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="UPDATE",
            entity_type="RoomResource",
            entity_id=room_resource.id,
            description=(
                f"Updated room resource assignment "
                f"#{room_resource.id}"
            ),
        )

        return room_resource

    def delete_room_resource(
        self,
        room_resource_id: int,
        user_id: int,
    ) -> dict:

        room_resource = (
            self.repository.get_room_resource_by_id(
                room_resource_id,
            )
        )

        if not room_resource:
            raise NotFoundException(
                "Room Resource",
            )

        self.repository.delete_room_resource(
            room_resource,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="DELETE",
            entity_type="RoomResource",
            entity_id=room_resource_id,
            description=(
                f"Deleted room resource assignment "
                f"#{room_resource_id}"
            ),
        )

        return {
            "message": DELETED_SUCCESS.format(
                "Room Resource",
            )
        }