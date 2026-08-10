from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role import Role


class RoleRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_role(
        self,
        role: Role,
    ) -> Role:

        self.db.add(role)

        self.db.commit()

        self.db.refresh(role)

        return role

    def update_role(
        self,
        role: Role,
        update_data: dict,
    ) -> Role:

        for field, value in update_data.items():
            setattr(role, field, value)

        self.db.commit()

        self.db.refresh(role)

        return role

    def get_role_by_id(
        self,
        role_id: int,
    ) -> Role | None:

        statement = select(Role).where(
            Role.id == role_id
        )

        return self.db.scalar(statement)

    def get_role_by_name(
        self,
        name: str,
    ) -> Role | None:

        statement = select(Role).where(
            Role.name == name
        )

        return self.db.scalar(statement)

    def get_roles(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Role]:

        statement = (
            select(Role)
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(statement).all()
        )