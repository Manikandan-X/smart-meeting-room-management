from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.room_resource import RoomResource


class RoomResourceRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_room_resource(
        self,
        room_resource: RoomResource,
    ) -> RoomResource:

        self.db.add(
            room_resource,
        )

        self.db.commit()

        self.db.refresh(
            room_resource,
        )

        return room_resource

    def get_room_resource_by_id(
        self,
        room_resource_id: int,
    ) -> RoomResource | None:

        statement = select(
            RoomResource,
        ).where(
            RoomResource.id == room_resource_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_room_resource(
        self,
        meeting_room_id: int,
        resource_id: int,
    ) -> RoomResource | None:

        statement = select(
            RoomResource,
        ).where(
            RoomResource.meeting_room_id
            == meeting_room_id,
            RoomResource.resource_id
            == resource_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_room_resources(
        self,
        meeting_room_id: int | None = None,
        resource_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[RoomResource]:

        statement = select(
            RoomResource,
        )

        if meeting_room_id is not None:
            statement = statement.where(
                RoomResource.meeting_room_id
                == meeting_room_id
            )

        if resource_id is not None:
            statement = statement.where(
                RoomResource.resource_id
                == resource_id
            )

        statement = (
            statement
            .order_by(
                RoomResource.id.asc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def update_room_resource(
        self,
        room_resource: RoomResource,
        update_data: dict,
    ) -> RoomResource:

        for field, value in update_data.items():

            setattr(
                room_resource,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            room_resource,
        )

        return room_resource

    def delete_room_resource(
        self,
        room_resource: RoomResource,
    ) -> None:

        self.db.delete(
            room_resource,
        )

        self.db.commit()
        
    def get_resources_by_room(
        self,
        meeting_room_id: int,
    ) -> list[RoomResource]:

        statement = select(
            RoomResource,
        ).where(
            RoomResource.meeting_room_id
            == meeting_room_id,
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )
        
    def get_room_resources_by_resource(
        self,
        resource_id: int,
    ) -> list[RoomResource]:

        statement = select(
            RoomResource,
        ).where(
            RoomResource.resource_id
            == resource_id,
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )