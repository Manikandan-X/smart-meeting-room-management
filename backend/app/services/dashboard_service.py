from datetime import datetime, timezone

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


class DashboardService:

    def __init__(
        self,
        dashboard_repository: DashboardRepository,
    ):
        self.dashboard_repository = (
            dashboard_repository
        )
        
    def _ensure_utc(
        self,
        value: datetime,
    ) -> datetime:

        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc,
            )

        return value.astimezone(
            timezone.utc,
        )

    def get_upcoming_meetings(
        self,
        limit: int = 10,
    ) -> list[UpcomingMeetingResponse]:

        current_time = datetime.now(
            timezone.utc,
        )

        bookings = (
            self.dashboard_repository
            .get_upcoming_bookings(
                current_time=current_time,
                limit=limit,
            )
        )

        return [
            UpcomingMeetingResponse.model_validate(
                booking,
            )
            for booking in bookings
        ]

    def get_available_rooms(
        self,
    ) -> list[AvailableRoomResponse]:

        current_time = datetime.now(
            timezone.utc,
        )

        rooms = (
            self.dashboard_repository
            .get_available_rooms(
                current_time=current_time,
            )
        )

        return [
            AvailableRoomResponse.model_validate(
                room,
            )
            for room in rooms
        ]

    def get_room_utilization(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> list[RoomUtilizationResponse]:
        
        start_date = self._ensure_utc(
            start_date,
        )

        end_date = self._ensure_utc(
            end_date,
        )

        if start_date >= end_date:
            raise ValueError(
                "start_date must be before end_date."
            )

        rows = (
            self.dashboard_repository
            .get_room_utilization(
                start_date=start_date,
                end_date=end_date,
            )
        )

        total_minutes = (
            end_date - start_date
        ).total_seconds() / 60

        room_minutes: dict[int, int] = {}
        room_names: dict[int, str] = {}

        for row in rows:

            room_id = row.id

            room_names[room_id] = row.name

            if room_id not in room_minutes:
                room_minutes[room_id] = 0

            if (
                row.start_time is None
                or row.end_time is None
            ):
                continue

            booking_start = max(
                self._ensure_utc(
                    row.start_time,
                ),
                start_date,
            )

            booking_end = min(
                self._ensure_utc(
                    row.end_time,
                ),
                end_date,
            )

            if booking_start < booking_end:

                booked_minutes = int(
                    (
                        booking_end
                        - booking_start
                    ).total_seconds()
                    / 60
                )

                room_minutes[room_id] += (
                    booked_minutes
                )

        results = []

        for room_id, room_name in room_names.items():

            booked_minutes = room_minutes.get(
                room_id,
                0,
            )

            utilization_percentage = 0.0

            if total_minutes > 0:

                utilization_percentage = round(
                    (
                        booked_minutes
                        / total_minutes
                    )
                    * 100,
                    2,
                )

            results.append(
                RoomUtilizationResponse(
                    meeting_room_id=room_id,
                    room_name=room_name,
                    booked_minutes=booked_minutes,
                    utilization_percentage=(
                        utilization_percentage
                    ),
                )
            )

        return results

    def get_resource_usage(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> list[ResourceUsageResponse]:

        start_date = self._ensure_utc(
            start_date,
        )

        end_date = self._ensure_utc(
            end_date,
        )

        if start_date >= end_date:
            raise ValueError(
                "start_date must be before end_date."
            )

        rows = (
            self.dashboard_repository
            .get_resource_usage(
                start_date=start_date,
                end_date=end_date,
            )
        )

        results = []

        for row in rows:

            results.append(
                ResourceUsageResponse(
                    resource_id=row.id,
                    resource_name=row.name,
                    total_quantity=int(
                        row.quantity or 0
                    ),
                    booked_quantity=int(
                        row.booked_quantity or 0
                    ),
                    booking_count=int(
                        row.booking_count or 0
                    ),
                )
            )

        return results
    
    def get_monthly_booking_report(
        self,
        year: int,
        month: int,
    ) -> MonthlyBookingReportResponse:

        if month < 1 or month > 12:
            raise ValueError(
                "Month must be between 1 and 12."
            )

        start_date = datetime(
            year,
            month,
            1,
            tzinfo=timezone.utc,
        )

        if month == 12:
            end_date = datetime(
                year + 1,
                1,
                1,
                tzinfo=timezone.utc,
            )
        else:
            end_date = datetime(
                year,
                month + 1,
                1,
                tzinfo=timezone.utc,
            )

        row = (
            self.dashboard_repository
            .get_monthly_booking_report(
                start_date=start_date,
                end_date=end_date,
            )
        )

        month_name = start_date.strftime(
            "%B %Y"
        )

        return MonthlyBookingReportResponse(
            month=month_name,
            total_bookings=int(
                row.total_bookings or 0
            ),
            confirmed_bookings=int(
                row.confirmed_bookings or 0
            ),
            cancelled_bookings=int(
                row.cancelled_bookings or 0
            ),
        )