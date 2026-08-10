from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import or_, select

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(
        self,
        user: User,
    ) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def get_user_by_id(
        self,
        user_id: int,
    ) -> User | None:

        statement = select(User).where(
            User.id == user_id
        )

        return self.db.scalar(statement)

    def get_user_by_email(
        self,
        email: str,
    ) -> User | None:

        statement = select(User).where(
            User.email == email
        )

        return self.db.scalar(statement)

    def get_users(
        self,
        search: str | None = None,
        role_id: int | None = None,
        department_id: int | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[User]:

        statement = select(User)

        if search:
            search_value = (
                f"%{search.strip()}%"
            )

            statement = statement.where(
                or_(
                    User.first_name.ilike(
                        search_value
                    ),
                    User.last_name.ilike(
                        search_value
                    ),
                    User.email.ilike(
                        search_value
                    ),
                )
            )

        if role_id is not None:
            statement = statement.where(
                User.role_id == role_id
            )

        if department_id is not None:
            statement = statement.where(
                User.department_id
                == department_id
            )

        statement = (
            statement
            .order_by(
                User.first_name.asc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement
            ).all()
        )

    def update_user(
        self,
        user: User,
        update_data: dict,
    ) -> User:

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_user(
        self,
        user: User,
    ) -> None:

        self.db.delete(user)
        self.db.commit()