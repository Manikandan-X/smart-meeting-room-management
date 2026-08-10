from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.models.role import Role
from app.repositories.role_repository import RoleRepository
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
)
from app.utils.audit_logger import log_audit


class RoleService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = RoleRepository(db)

    def create_role(
        self,
        role_data: RoleCreate,
        user_id: int,
    ) -> Role:

        existing_role = (
            self.repository.get_role_by_name(
                role_data.name.strip()
            )
        )

        if existing_role:
            raise AlreadyExistsException(
                "Role"
            )

        role = Role(
            name=role_data.name.strip(),
            description=(
                role_data.description.strip()
                if role_data.description
                else None
            ),
        )

        role = self.repository.create_role(
            role
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="CREATE",
            entity_type="Role",
            entity_id=role.id,
            description=(
                f"Created role "
                f"'{role.name}'"
            ),
        )

        return role

    def update_role(
        self,
        role_id: int,
        role_data: RoleUpdate,
        user_id: int,
    ) -> Role:

        role = self.repository.get_role_by_id(
            role_id
        )

        if not role:
            raise NotFoundException(
                "Role"
            )

        update_data = role_data.model_dump(
            exclude_unset=True,
        )

        if "name" in update_data:

            update_data["name"] = (
                update_data["name"].strip()
            )

            existing_role = (
                self.repository.get_role_by_name(
                    update_data["name"]
                )
            )

            if (
                existing_role
                and existing_role.id != role.id
            ):
                raise AlreadyExistsException(
                    "Role"
                )

        if "description" in update_data:

            update_data["description"] = (
                update_data["description"].strip()
                if update_data["description"]
                else None
            )

        role = self.repository.update_role(
            role,
            update_data,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="UPDATE",
            entity_type="Role",
            entity_id=role.id,
            description=(
                f"Updated role "
                f"'{role.name}'"
            ),
        )

        return role

    def get_role(
        self,
        role_id: int,
    ) -> Role:

        role = self.repository.get_role_by_id(
            role_id
        )

        if not role:
            raise NotFoundException(
                "Role"
            )

        return role

    def get_roles(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Role]:

        return self.repository.get_roles(
            skip=skip,
            limit=limit,
        )