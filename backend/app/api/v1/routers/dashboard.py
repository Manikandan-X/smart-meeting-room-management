from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.dependencies import (
    get_current_admin,
    get_current_user,
)
from app.models.user import User
from app.db.session import get_db
from app.repositories.dashboard_repository import (
    DashboardRepository,
)
from app.schemas.dashboard import (
    AvailableRoomResponse,
    ResourceUsageResponse,
    RoomUtilizationResponse,
    UpcomingMeetingResponse,
    MonthlyBookingReportResponse,
)
from app.services.dashboard_service import (
    DashboardService,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_dashboard_service(
    db: Session = Depends(get_db),
) -> DashboardService:

    dashboard_repository = (
        DashboardRepository(db)
    )

    return DashboardService(
        dashboard_repository,
    )


@router.get(
    "/upcoming-meetings",
    response_model=list[UpcomingMeetingResponse],
)
def get_upcoming_meetings(
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    
    current_user=Depends(get_current_admin),
    
    dashboard_service: DashboardService = Depends(
        get_dashboard_service,
    ),
):
    return dashboard_service.get_upcoming_meetings(
        limit=limit,
    )


@router.get(
    "/available-rooms",
    response_model=list[AvailableRoomResponse],
)
def get_available_rooms(
    
    current_user: User = Depends(get_current_user),
    
    dashboard_service: DashboardService = Depends(
        get_dashboard_service,
    ),
    
    
):
    return dashboard_service.get_available_rooms()


@router.get(
    "/room-utilization",
    response_model=list[RoomUtilizationResponse],
)
def get_room_utilization(
    start_date: datetime = Query(
        ...,
        description="Report start date and time",
    ),
    end_date: datetime = Query(
        ...,
        description="Report end date and time",
    ),
    
    current_user=Depends(get_current_admin),
    
    dashboard_service: DashboardService = Depends(
        get_dashboard_service,
    ),
):
    return dashboard_service.get_room_utilization(
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/resource-usage",
    response_model=list[ResourceUsageResponse],
)
def get_resource_usage(
    start_date: datetime = Query(
        ...,
        description="Report start date and time",
    ),
    end_date: datetime = Query(
        ...,
        description="Report end date and time",
    ),
    
    current_user=Depends(get_current_admin),
    
    dashboard_service: DashboardService = Depends(
        get_dashboard_service,
    ),
):
    return dashboard_service.get_resource_usage(
        start_date=start_date,
        end_date=end_date,
    )
    
@router.get(
    "/monthly-booking-report",
    response_model=MonthlyBookingReportResponse,
)
def get_monthly_booking_report(
    year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),
    
    current_user=Depends(get_current_admin),
    
    dashboard_service: DashboardService = Depends(
        get_dashboard_service,
    ),
):
    return dashboard_service.get_monthly_booking_report(
        year=year,
        month=month,
    )