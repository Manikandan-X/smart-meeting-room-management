from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.core.security import hash_password

from app.models.user import User

from app.repositories.user_repository import UserRepository
from app.repositories.role_repository import RoleRepository
from app.repositories.department_repository import DepartmentRepository

from app.schemas.user import (
    UserCreate,
    UserUpdate,
)
from app.utils.audit_logger import log_audit


class UserService:
    def __init__(
        self,
        db: Session,
    ):
        self.user_repository = UserRepository(db)
        self.role_repository = RoleRepository(db)
        self.department_repository = DepartmentRepository(db)


    def get_user(
        self,
        user_id: int,
    ) -> User:

        user = (
            self.user_repository.get_user_by_id(
                user_id
            )
        )

        if not user:
            raise NotFoundException(
                "User"
            )

        return user

    def get_users(
        self,
        search: str | None = None,
        role_id: int | None = None,
        department_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[User]:

        return self.user_repository.get_users(
            search=search,
            role_id=role_id,
            department_id=department_id,
            skip=skip,
            limit=limit,
        )

    def update_user(
        self,
        user_id: int,
        user_data: UserUpdate,
        actor_id: int,
    ) -> User:

        user = (
            self.user_repository.get_user_by_id(
                user_id
            )
        )

        if not user:
            raise NotFoundException(
                "User"
            )

        update_data = (
            user_data
            .model_dump(exclude_unset=True)
        )

        if "email" in update_data:

            email = (
                update_data["email"]
                .lower()
                .strip()
            )

            existing_user = (
                self.user_repository.get_user_by_email(
                    email
                )
            )

            if (
                existing_user
                and existing_user.id != user.id
            ):
                raise AlreadyExistsException(
                    "User with this email"
                )

            update_data["email"] = email


        if "password" in update_data:

            update_data["password_hash"] = (
                hash_password(
                    update_data.pop("password")
                )
            )


        if "first_name" in update_data:
            update_data["first_name"] = (
                update_data["first_name"].strip()
            )


        if "last_name" in update_data:
            update_data["last_name"] = (
                update_data["last_name"].strip()
            )


        if "role_id" in update_data:

            role = (
                self.role_repository.get_role_by_id(
                    update_data["role_id"]
                )
            )

            if not role:
                raise NotFoundException(
                    "Role"
                )


        if "department_id" in update_data:

            department = (
                self.department_repository.get_department_by_id(
                    update_data["department_id"]
                )
            )

            if not department:
                raise NotFoundException(
                    "Department"
                )


        user = self.user_repository.update_user(
            user,
            update_data,
        )

        log_audit(
            db=self.user_repository.db,
            user_id=actor_id,
            action="UPDATE",
            entity_type="User",
            entity_id=user.id,
            description=(
                f"Updated user "
                f"'{user.email}'"
            ),
        )

        return user

    def delete_user(
        self,
        user_id: int,
        actor_id: int,
    ) -> dict:

        user = (
            self.user_repository.get_user_by_id(
                user_id
            )
        )

        if not user:
            raise NotFoundException(
                "User"
            )

        user_email = user.email

        self.user_repository.delete_user(
            user
        )

        log_audit(
            db=self.user_repository.db,
            user_id=actor_id,
            action="DELETE",
            entity_type="User",
            entity_id=user_id,
            description=(
                f"Deleted user "
                f"'{user_email}'"
            ),
        )

        return {
            "message": "User deleted successfully."
        }