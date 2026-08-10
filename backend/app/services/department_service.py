from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsException,
    NotFoundException,
)
from app.core.messages import DELETED_SUCCESS
from app.models.department import Department
from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
)
from app.utils.audit_logger import log_audit


class DepartmentService:
    def __init__(self, db: Session):
        self.repository = DepartmentRepository(db)

    def create_department(
        self,
        department_data: DepartmentCreate,
        user_id: int,
    ) -> Department:

        name = department_data.name.strip()

        existing_department = (
            self.repository.get_department_by_name(name)
        )

        if existing_department:
            raise AlreadyExistsException(
                "Department"
            )

        department = Department(
            name=name,
            description=department_data.description,
        )

        department = self.repository.create_department(
            department
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="CREATE",
            entity_type="Department",
            entity_id=department.id,
            description=(
                f"Created department "
                f"'{department.name}'"
            ),
        )

        return department

    def get_department(
        self,
        department_id: int,
    ) -> Department:

        department = (
            self.repository.get_department_by_id(
                department_id
            )
        )

        if not department:
            raise NotFoundException(
                "Department"
            )

        return department

    def get_departments(
        self,
        search: str | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Department]:

        return self.repository.get_departments(
            search=search,
            skip=skip,
            limit=limit,
        )

    def update_department(
        self,
        department_id: int,
        department_data: DepartmentUpdate,
        user_id: int,
    ) -> Department:

        department = (
            self.repository.get_department_by_id(
                department_id
            )
        )

        if not department:
            raise NotFoundException(
                "Department"
            )

        update_data = (
            department_data
            .model_dump(exclude_unset=True)
        )

        if "name" in update_data:

            update_data["name"] = (
                update_data["name"].strip()
            )

            existing_department = (
                self.repository.get_department_by_name(
                    update_data["name"]
                )
            )

            if (
                existing_department
                and existing_department.id != department.id
            ):
                raise AlreadyExistsException(
                    "Department"
                )

        department = self.repository.update_department(
            department,
            update_data,
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="UPDATE",
            entity_type="Department",
            entity_id=department.id,
            description=(
                f"Updated department "
                f"'{department.name}'"
            ),
        )

        return department

    def delete_department(
        self,
        department_id: int,
        user_id: int,
    ) -> dict:

        department = (
            self.repository.get_department_by_id(
                department_id
            )
        )

        if not department:
            raise NotFoundException(
                "Department"
            )

        department_name = department.name

        self.repository.delete_department(
            department
        )

        log_audit(
            db=self.repository.db,
            user_id=user_id,
            action="DELETE",
            entity_type="Department",
            entity_id=department_id,
            description=(
                f"Deleted department "
                f"'{department_name}'"
            ),
        )

        return {
            "message": DELETED_SUCCESS.format(
                "Department"
            )
        }