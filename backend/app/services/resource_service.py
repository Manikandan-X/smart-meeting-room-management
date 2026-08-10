from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.core.messages import (
    DELETED_SUCCESS,
)
from app.models.resource import Resource
from app.repositories.resource_repository import (
    ResourceRepository,
)
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
)
from app.utils.audit_logger import log_audit


class ResourceService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = ResourceRepository(
            db,
        )

    def create_resource(
        self,
        resource_data: ResourceCreate,
        user_id: int,
    ) -> Resource:

        existing_resource = (
            self.repository.get_resource_by_name(
                resource_data.name.strip(),
            )
        )

        if existing_resource:
            raise AlreadyExistsException(
                "Resource",
            )

        resource = Resource(
            name=resource_data.name.strip(),
            quantity=resource_data.quantity,
            is_available=resource_data.is_available,
        )

        resource = self.repository.create_resource(
            resource,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="CREATE",
            entity_type="Resource",
            entity_id=resource.id,
            description=(
                f"Created resource "
                f"'{resource.name}'"
            ),
        )

        return resource

    def get_resource(
        self,
        resource_id: int,
    ) -> Resource:

        resource = (
            self.repository.get_resource_by_id(
                resource_id,
            )
        )

        if not resource:
            raise NotFoundException(
                "Resource",
            )

        return resource

    def get_resources(
        self,
        search: str | None = None,
        is_available: bool | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Resource]:

        return self.repository.get_resources(
            search=search,
            is_available=is_available,
            skip=skip,
            limit=limit,
        )

    def update_resource(
        self,
        resource_id: int,
        resource_data: ResourceUpdate,
        user_id: int,
    ) -> Resource:

        resource = (
            self.repository.get_resource_by_id(
                resource_id,
            )
        )

        if not resource:
            raise NotFoundException(
                "Resource",
            )

        if resource_data.name:

            existing_resource = (
                self.repository.get_resource_by_name(
                    resource_data.name.strip(),
                )
            )

            if (
                existing_resource
                and existing_resource.id != resource.id
            ):
                raise AlreadyExistsException(
                    "Resource",
                )

        update_data = resource_data.model_dump(
            exclude_unset=True,
        )

        if "name" in update_data:
            update_data["name"] = (
                update_data["name"].strip()
            )

        resource = self.repository.update_resource(
            resource,
            update_data,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="UPDATE",
            entity_type="Resource",
            entity_id=resource.id,
            description=(
                f"Updated resource "
                f"'{resource.name}'"
            ),
        )

        return resource

    def delete_resource(
        self,
        resource_id: int,
        user_id: int,
    ) -> dict:

        resource = (
            self.repository.get_resource_by_id(
                resource_id,
            )
        )

        if not resource:
            raise NotFoundException(
                "Resource",
            )

        resource_name = resource.name

        self.repository.delete_resource(
            resource,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="DELETE",
            entity_type="Resource",
            entity_id=resource_id,
            description=(
                f"Deleted resource "
                f"'{resource_name}'"
            ),
        )

        return {
            "message": DELETED_SUCCESS.format(
                "Resource",
            )
        }