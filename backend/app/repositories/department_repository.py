from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department


class DepartmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_department(
        self,
        department: Department,
    ) -> Department:
        self.db.add(department)
        self.db.commit()
        self.db.refresh(department)

        return department

    def get_department_by_id(
        self,
        department_id: int,
    ) -> Department | None:
        statement = select(Department).where(
            Department.id == department_id
        )

        return self.db.scalar(statement)

    def get_department_by_name(
        self,
        name: str,
    ) -> Department | None:
        statement = select(Department).where(
            Department.name == name
        )

        return self.db.scalar(statement)

    def get_departments(
        self,
        search: str | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Department]:

        statement = select(
            Department,
        )

        if search:
            statement = statement.where(
                Department.name.ilike(
                    f"%{search.strip()}%"
                )
            )

        statement = (
            statement
            .order_by(
                Department.name.asc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def update_department(
        self,
        department: Department,
        update_data: dict,
    ) -> Department:
        for field, value in update_data.items():
            setattr(department, field, value)

        self.db.commit()
        self.db.refresh(department)

        return department

    def delete_department(
        self,
        department: Department,
    ) -> None:
        self.db.delete(department)
        self.db.commit()