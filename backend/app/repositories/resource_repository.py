from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resource import Resource


class ResourceRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_resource(
        self,
        resource: Resource,
    ) -> Resource:

        self.db.add(
            resource,
        )

        self.db.commit()

        self.db.refresh(
            resource,
        )

        return resource

    def get_resource_by_id(
        self,
        resource_id: int,
    ) -> Resource | None:

        statement = select(
            Resource,
        ).where(
            Resource.id == resource_id,
        )

        return self.db.scalar(
            statement,
        )

    def get_resource_by_name(
        self,
        name: str,
    ) -> Resource | None:

        statement = select(
            Resource,
        ).where(
            Resource.name == name,
        )

        return self.db.scalar(
            statement,
        )

    def get_resources(
        self,
        search: str | None = None,
        is_available: bool | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Resource]:

        statement = select(
            Resource,
        )

        if search:
            statement = statement.where(
                Resource.name.ilike(
                    f"%{search.strip()}%"
                )
            )

        if is_available is not None:
            statement = statement.where(
                Resource.is_available
                == is_available
            )

        statement = (
            statement
            .order_by(Resource.name.asc())
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def update_resource(
        self,
        resource: Resource,
        update_data: dict,
    ) -> Resource:

        for field, value in update_data.items():

            setattr(
                resource,
                field,
                value,
            )

        self.db.commit()

        self.db.refresh(
            resource,
        )

        return resource

    def delete_resource(
        self,
        resource: Resource,
    ) -> None:

        self.db.delete(
            resource,
        )

        self.db.commit()