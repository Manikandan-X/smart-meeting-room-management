from fastapi import (
    APIRouter,
    Depends,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    MeResponse,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.register(
        user_data
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.login(
        email=form_data.username,
        password=form_data.password,
    )
    
@router.get(
    "/me",
    response_model=MeResponse,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
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

@router.patch(
    "/change-password",
    status_code=status.HTTP_200_OK,
)
def change_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuthService(db)

    return service.change_password(
        user=current_user,
        current_password=password_data.current_password,
        new_password=password_data.new_password,
    )
    
@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    password_data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.forgot_password(
        email=password_data.email,
        reset_url_base=(
            "http://localhost:5173/reset-password"
        ),
    )
    
@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
def reset_password(
    password_data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.reset_password(
        token=password_data.token,
        new_password=password_data.new_password,
    )

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuthService(db)

    return service.logout(
        current_user,
    )
    
