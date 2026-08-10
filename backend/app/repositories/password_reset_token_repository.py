from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken


class PasswordResetTokenRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_token(
        self,
        token: PasswordResetToken,
    ) -> PasswordResetToken:

        self.db.add(token)

        self.db.commit()

        self.db.refresh(
            token,
        )

        return token

    def get_by_token_hash(
        self,
        token_hash: str,
    ) -> PasswordResetToken | None:

        statement = select(
            PasswordResetToken,
        ).where(
            PasswordResetToken.token_hash
            == token_hash,
        )

        return self.db.scalar(
            statement,
        )

    def mark_as_used(
        self,
        token: PasswordResetToken,
        used_at: datetime,
    ) -> PasswordResetToken:

        token.used_at = used_at

        self.db.commit()

        self.db.refresh(
            token,
        )

        return token

    def delete_expired_tokens(
        self,
        current_time: datetime,
    ) -> int:

        statement = select(
            PasswordResetToken,
        ).where(
            PasswordResetToken.expires_at
            < current_time,
        )

        tokens = list(
            self.db.scalars(
                statement,
            ).all()
        )

        for token in tokens:
            self.db.delete(token)

        self.db.commit()

        return len(tokens)