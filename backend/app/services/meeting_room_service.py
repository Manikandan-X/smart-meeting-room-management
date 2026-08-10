from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.core.messages import (
    DELETED_SUCCESS,
)
from sqlalchemy.orm import Session
from app.models.meeting_room import MeetingRoom
from app.repositories.meeting_room_repository import (
    MeetingRoomRepository,
)
from app.schemas.meeting_room import (
    MeetingRoomCreate,
    MeetingRoomUpdate,
)
from app.utils.audit_logger import log_audit

class MeetingRoomService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = MeetingRoomRepository(
            db
        )

    def create_meeting_room(
        self,
        meeting_room_data: MeetingRoomCreate,
        user_id: int,
    ) -> MeetingRoom:

        existing_room = (
            self.repository.get_meeting_room_by_name(
                meeting_room_data.name.strip()
            )
        )

        if existing_room:
            raise AlreadyExistsException(
                "Meeting Room"
            )

        meeting_room = MeetingRoom(
            name=meeting_room_data.name.strip(),
            capacity=meeting_room_data.capacity,
            facilities=meeting_room_data.facilities.strip(),
            is_available=meeting_room_data.is_available,
        )

        meeting_room = self.repository.create_meeting_room(
            meeting_room
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="CREATE",
            entity_type="MeetingRoom",
            entity_id=meeting_room.id,
            description=(
                f"Created meeting room "
                f"'{meeting_room.name}'"
            ),
        )

        return meeting_room

    def get_meeting_room(
        self,
        meeting_room_id: int,
    ) -> MeetingRoom:

        meeting_room = (
            self.repository.get_meeting_room_by_id(
                meeting_room_id
            )
        )

        if not meeting_room:
            raise NotFoundException(
                "Meeting Room"
            )

        return meeting_room

    def get_meeting_rooms(
        self,
        search: str | None = None,
        is_available: bool | None = None,
        min_capacity: int | None = None,
        max_capacity: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[MeetingRoom]:

        return self.repository.get_meeting_rooms(
            search=search,
            is_available=is_available,
            min_capacity=min_capacity,
            max_capacity=max_capacity,
            skip=skip,
            limit=limit,
        )

    def update_meeting_room(
        self,
        meeting_room_id: int,
        meeting_room_data: MeetingRoomUpdate,
        user_id: int,
    ) -> MeetingRoom:

        meeting_room = (
            self.repository.get_meeting_room_by_id(
                meeting_room_id
            )
        )

        if not meeting_room:
            raise NotFoundException(
                "Meeting Room"
            )

        if meeting_room_data.name:

            existing_room = (
                self.repository.get_meeting_room_by_name(
                    meeting_room_data.name.strip()
                )
            )

            if (
                existing_room
                and existing_room.id != meeting_room.id
            ):
                raise AlreadyExistsException(
                    "Meeting Room"
                )

        update_data = meeting_room_data.model_dump(
            exclude_unset=True,
        )

        if "name" in update_data:
            update_data["name"] = (
                update_data["name"].strip()
            )

        if "facilities" in update_data:
            update_data["facilities"] = (
                update_data["facilities"].strip()
            )

        meeting_room = self.repository.update_meeting_room(
            meeting_room,
            update_data,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="UPDATE",
            entity_type="MeetingRoom",
            entity_id=meeting_room.id,
            description=(
                f"Updated meeting room "
                f"'{meeting_room.name}'"
            ),
        )

        return meeting_room

    def delete_meeting_room(
        self,
        meeting_room_id: int,
        user_id: int,
    ) -> dict:

        meeting_room = (
            self.repository.get_meeting_room_by_id(
                meeting_room_id
            )
        )

        if not meeting_room:
            raise NotFoundException(
                "Meeting Room"
            )

        room_name = meeting_room.name

        self.repository.delete_meeting_room(
            meeting_room,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="DELETE",
            entity_type="MeetingRoom",
            entity_id=meeting_room_id,
            description=(
                f"Deleted meeting room "
                f"'{room_name}'"
            ),
        )

        return {
            "message": DELETED_SUCCESS.format(
                "Meeting Room"
            )
        }