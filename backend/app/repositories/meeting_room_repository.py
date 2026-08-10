from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.meeting_room import MeetingRoom


class MeetingRoomRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_meeting_room(
        self,
        meeting_room: MeetingRoom,
    ) -> MeetingRoom:

        self.db.add(
            meeting_room,
        )

        self.db.commit()

        self.db.refresh(
            meeting_room,
        )

        return meeting_room

    def get_meeting_room_by_id(
        self,
        meeting_room_id: int,
    ) -> MeetingRoom | None:

        statement = select(
            MeetingRoom,
        ).where(
            MeetingRoom.id == meeting_room_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_meeting_room_by_name(
        self,
        name: str,
    ) -> MeetingRoom | None:

        statement = select(
            MeetingRoom,
        ).where(
            MeetingRoom.name == name,
        )

        return self.db.scalar(
            statement,
        )

    def get_meeting_rooms(
        self,
        search: str | None = None,
        is_available: bool | None = None,
        min_capacity: int | None = None,
        max_capacity: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[MeetingRoom]:

        statement = select(
            MeetingRoom,
        )

        if search:
            statement = statement.where(
                MeetingRoom.name.ilike(
                    f"%{search.strip()}%"
                )
            )

        if is_available is not None:
            statement = statement.where(
                MeetingRoom.is_available
                == is_available
            )

        if min_capacity is not None:
            statement = statement.where(
                MeetingRoom.capacity
                >= min_capacity
            )

        if max_capacity is not None:
            statement = statement.where(
                MeetingRoom.capacity
                <= max_capacity
            )

        statement = (
            statement
            .order_by(MeetingRoom.name.asc())
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def update_meeting_room(
        self,
        meeting_room: MeetingRoom,
        update_data: dict,
    ) -> MeetingRoom:

        for field, value in update_data.items():

            setattr(
                meeting_room,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            meeting_room,
        )

        return meeting_room

    def delete_meeting_room(
        self,
        meeting_room: MeetingRoom,
    ) -> None:

        self.db.delete(
            meeting_room,
        )

        self.db.commit()