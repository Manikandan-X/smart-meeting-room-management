from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.core.exceptions import (
    AlreadyExistsException,
    InvalidCredentialsException,
    NotFoundException,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    hash_password_reset_token,
    generate_password_reset_token,
)
from app.core.exceptions import (
    ValidationException,
)
from app.models.user import User
from app.models.password_reset_token import (
    PasswordResetToken,
)
from app.repositories.department_repository import DepartmentRepository
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.repositories.password_reset_token_repository import (
    PasswordResetTokenRepository,
)

from app.schemas.auth import TokenResponse, MeResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserCreate
from app.utils.audit_logger import log_audit
from app.services.email_service import EmailService

class AuthService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

        self.user_repository = UserRepository(
            db
        )

        self.role_repository = RoleRepository(
            db
        )

        self.department_repository = (
            DepartmentRepository(db)
        )

        self.password_reset_token_repository = (
            PasswordResetTokenRepository(db)
        )

        self.email_service = EmailService()
        

    def register(
        self,
        user_data: UserCreate,
    ) -> User:

        email = user_data.email.lower().strip()

        existing_user = (
            self.user_repository.get_user_by_email(
                email
            )
        )

        if existing_user:
            raise AlreadyExistsException(
                "User with this email"
            )

        department = (
            self.department_repository.get_department_by_id(
                user_data.department_id
            )
        )

        if not department:
            raise NotFoundException(
                "Department"
            )

        employee_role = (
            self.role_repository.get_role_by_name(
                "Employee"
            )
        )

        if not employee_role:
            raise NotFoundException(
                "Employee role"
            )

        user = User(
            first_name=user_data.first_name.strip(),
            last_name=user_data.last_name.strip(),
            email=email,
            password_hash=hash_password(
                user_data.password
            ),
            role_id=employee_role.id,
            department_id=department.id,
        )

        return self.user_repository.create_user(
            user
        )

    def login(
        self,
        email: str,
        password: str,
    ) -> TokenResponse:

        user = (
            self.user_repository.get_user_by_email(
                email.lower().strip()
            )
        )

        if not user:
            raise InvalidCredentialsException()

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise InvalidCredentialsException()

        access_token = create_access_token(
            {
                "sub": user.email,
            }
        )

        log_audit(
            db=self.db,
            user_id=user.id,
            action="LOGIN",
            entity_type="Authentication",
            entity_id=user.id,
            description=(
                f"User "
                f"'{user.email}' logged in"
            ),
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
        )

    def get_me(
        self,
        current_user: User,
    ) -> MeResponse:

        return MeResponse(
            id=current_user.id,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            email=current_user.email,
            role_id=current_user.role.id,
            role_name=current_user.role.name,
            department_id=current_user.department.id,
            department_name=current_user.department.name,
        )

    def logout(
        self,
        current_user: User,
    ) -> dict:

        log_audit(
            db=self.db,
            user_id=current_user.id,
            action="LOGOUT",
            entity_type="Authentication",
            entity_id=current_user.id,
            description=(
                f"User "
                f"'{current_user.email}' logged out"
            ),
        )

        return {
            "message": "Logged out successfully."
        }
        
    def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
    ) -> dict:

        if not verify_password(
            current_password,
            user.password_hash,
        ):
            raise ValidationException(
                "Current password is incorrect."
            )

        if current_password == new_password:
            raise ValidationException(
                "New password must be different from the current password."
            )

        user.password_hash = hash_password(
            new_password,
        )

        self.user_repository.update_user(
            user,
            {
                "password_hash": user.password_hash,
            },
        )

        log_audit(
            db=self.db,
            user_id=user.id,
            action="CHANGE_PASSWORD",
            entity_type="Authentication",
            entity_id=user.id,
            description=(
                f"User '{user.email}' changed "
                "their password."
            ),
        )

        return {
            "message": "Password changed successfully."
        }
        
    def forgot_password(
        self,
        email: str,
        reset_url_base: str,
    ) -> dict:

        email = email.lower().strip()

        user = (
            self.user_repository.get_user_by_email(
                email
            )
        )

        # Do not reveal whether the email exists.
        if not user:
            return {
                "message": (
                    "If an account exists with this "
                    "email, a password reset link "
                    "has been sent."
                )
            }

        reset_token = (
            generate_password_reset_token()
        )

        token_hash = (
            hash_password_reset_token(
                reset_token
            )
        )

        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(minutes=30)
        )

        password_reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            used_at=None,
        )

        self.password_reset_token_repository.create_token(
            password_reset_token
        )

        reset_url = (
            f"{reset_url_base}"
            f"?token={reset_token}"
        )

        self.email_service.send_password_reset_email(
            to_email=user.email,
            reset_url=reset_url,
        )

        log_audit(
            db=self.db,
            user_id=user.id,
            action="FORGOT_PASSWORD",
            entity_type="Authentication",
            entity_id=user.id,
            description=(
                f"Password reset requested "
                f"for user '{user.email}'."
            ),
        )

        return {
            "message": (
                "If an account exists with this "
                "email, a password reset link "
                "has been sent."
            )
        }
        
    def reset_password(
        self,
        token: str,
        new_password: str,
    ) -> dict:

        token_hash = (
            hash_password_reset_token(
                token
            )
        )

        reset_token = (
            self.password_reset_token_repository
            .get_by_token_hash(
                token_hash
            )
        )

        if not reset_token:
            raise ValidationException(
                "Invalid or expired password reset token."
            )

        if reset_token.used_at is not None:
            raise ValidationException(
                "Password reset token has already been used."
            )

        current_time = datetime.now(
            timezone.utc
        )

        expires_at = reset_token.expires_at

        # MySQL's DATETIME column drops timezone info on
        # write/read, so values coming back from the DB are
        # naive even though we stored an aware UTC value.
        # Normalize before comparing to avoid a TypeError
        # ("can't compare offset-naive and offset-aware
        # datetimes").
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(
                tzinfo=timezone.utc
            )

        if expires_at <= current_time:
            raise ValidationException(
                "Invalid or expired password reset token."
            )

        user = (
            self.user_repository.get_user_by_id(
                reset_token.user_id
            )
        )

        if not user:
            raise NotFoundException(
                "User"
            )

        user.password_hash = hash_password(
            new_password
        )

        self.user_repository.update_user(
            user,
            {
                "password_hash": user.password_hash,
            },
        )

        self.password_reset_token_repository.mark_as_used(
            reset_token,
            current_time,
        )

        log_audit(
            db=self.db,
            user_id=user.id,
            action="RESET_PASSWORD",
            entity_type="Authentication",
            entity_id=user.id,
            description=(
                f"User '{user.email}' reset "
                "their password."
            ),
        )

        return {
            "message": (
                "Password reset successfully."
            )
        }