from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import BookingStatus
from app.models.user import User
from app.repositories.report_repository import (
    ReportRepository,
)
from app.schemas.report import (
    BookingHistoryResponse,
)
from app.services.report_service import (
    ReportService,
)


from app.core.dependencies import (
    get_current_admin,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


def get_report_service(
    db: Session = Depends(get_db),
) -> ReportService:

    report_repository = ReportRepository(
        db,
    )

    return ReportService(
        report_repository,
    )


@router.get(
    "/booking-history",
    response_model=list[BookingHistoryResponse],
)
def get_booking_history(
    user_id: int | None = Query(
        default=None,
        ge=1,
    ),
    meeting_room_id: int | None = Query(
        default=None,
        ge=1,
    ),
    status: BookingStatus | None = Query(
        default=None,
    ),
    start_date: datetime | None = Query(
        default=None,
        description="Filter bookings from this date",
    ),
    end_date: datetime | None = Query(
        default=None,
        description="Filter bookings until this date",
    ),
    current_user=Depends(get_current_admin),
    report_service: ReportService = Depends(
        get_report_service,
    ),
):
    return report_service.get_booking_history(
        user_id=user_id,
        meeting_room_id=meeting_room_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    
@router.get(
    "/booking-history/export/excel",
)
def export_booking_history_excel(
    user_id: int | None = Query(
        default=None,
        ge=1,
    ),
    meeting_room_id: int | None = Query(
        default=None,
        ge=1,
    ),
    status: BookingStatus | None = Query(
        default=None,
    ),
    start_date: datetime | None = Query(
        default=None,
    ),
    end_date: datetime | None = Query(
        default=None,
    ),
    current_user=Depends(get_current_admin),
    report_service: ReportService = Depends(
        get_report_service,
    ),
):
    file = report_service.export_booking_history_excel(
        user_id=user_id,
        meeting_room_id=meeting_room_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )

    return StreamingResponse(
        file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                "attachment; "
                'filename="booking_history.xlsx"'
            ),
        },
    )
    
@router.get(
    "/booking-history/export/pdf",
)
def export_booking_history_pdf(
    user_id: int | None = Query(
        default=None,
        ge=1,
    ),
    meeting_room_id: int | None = Query(
        default=None,
        ge=1,
    ),
    status: BookingStatus | None = Query(
        default=None,
    ),
    start_date: datetime | None = Query(
        default=None,
    ),
    end_date: datetime | None = Query(
        default=None,
    ),
    current_user=Depends(get_current_admin),
    report_service: ReportService = Depends(
        get_report_service,
    ),
):
    file = report_service.export_booking_history_pdf(
        user_id=user_id,
        meeting_room_id=meeting_room_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )

    return StreamingResponse(
        file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                'filename="booking_history.pdf"'
            ),
        },
    )