from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)
from app.services.department_service import DepartmentService


router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = DepartmentService(db)

    return service.create_department(
        department_data,
        current_user.id,
    )


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DepartmentService(db)

    return service.get_department(
        department_id
    )


@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
def get_departments(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    service = DepartmentService(db)

    return service.get_departments(
        search=search,
        skip=skip,
        limit=limit,
    )


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = DepartmentService(db)

    return service.update_department(
        department_id,
        department_data,
        current_user.id,
    )


@router.delete(
    "/{department_id}",
    status_code=status.HTTP_200_OK,
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    service = DepartmentService(db)

    return service.delete_department(
        department_id,
        current_user.id,
    )