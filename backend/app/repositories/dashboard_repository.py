from datetime import datetime

from sqlalchemy import and_, func, select, case
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.booking_resource import BookingResource
from app.models.enums import BookingStatus
from app.models.meeting_room import MeetingRoom
from app.models.resource import Resource


class DashboardRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_upcoming_bookings(
        self,
        current_time: datetime,
        limit: int = 10,
    ) -> list[Booking]:

        statement = (
            select(Booking)
            .where(
                and_(
                    Booking.start_time >= current_time,
                    Booking.status
                    != BookingStatus.CANCELLED,
                )
            )
            .order_by(
                Booking.start_time.asc(),
            )
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def get_available_rooms(
        self,
        current_time: datetime,
    ) -> list[MeetingRoom]:

        booked_room_ids = (
            select(Booking.meeting_room_id)
            .where(
                and_(
                    Booking.start_time
                    <= current_time,
                    Booking.end_time
                    > current_time,
                    Booking.status
                    != BookingStatus.CANCELLED,
                )
            )
        )

        statement = (
            select(MeetingRoom)
            .where(
                MeetingRoom.is_available.is_(True),
                MeetingRoom.id.not_in(
                    booked_room_ids
                ),
            )
            .order_by(
                MeetingRoom.name.asc(),
            )
        )

        return list(
            self.db.scalars(
                statement,
            ).all()
        )

    def get_room_utilization(
        self,
        start_date: datetime,
        end_date: datetime,
    ):

        statement = (
            select(
                MeetingRoom.id,
                MeetingRoom.name,
                Booking.start_time,
                Booking.end_time,
            )
            .outerjoin(
                Booking,
                and_(
                    Booking.meeting_room_id
                    == MeetingRoom.id,
                    Booking.start_time
                    < end_date,
                    Booking.end_time
                    > start_date,
                    Booking.status
                    != BookingStatus.CANCELLED,
                ),
            )
            .order_by(
                MeetingRoom.name.asc(),
            )
        )

        return self.db.execute(
            statement,
        ).all()

    def get_resource_usage(
        self,
        start_date: datetime,
        end_date: datetime,
    ):

        statement = (
            select(
                Resource.id,
                Resource.name,
                Resource.quantity,
                func.coalesce(
                    func.sum(
                        BookingResource.quantity
                    ),
                    0,
                ).label(
                    "booked_quantity",
                ),
                func.count(
                    func.distinct(
                        BookingResource.booking_id
                    )
                ).label(
                    "booking_count",
                ),
            )
            .outerjoin(
                BookingResource,
                BookingResource.resource_id
                == Resource.id,
            )
            .outerjoin(
                Booking,
                and_(
                    Booking.id
                    == BookingResource.booking_id,
                    Booking.start_time
                    < end_date,
                    Booking.end_time
                    > start_date,
                    Booking.status
                    != BookingStatus.CANCELLED,
                ),
            )
            .group_by(
                Resource.id,
                Resource.name,
                Resource.quantity,
            )
            .order_by(
                Resource.name.asc(),
            )
        )

        return self.db.execute(
            statement
        ).all()
        
        
    def get_monthly_booking_report(
        self,
        start_date: datetime,
        end_date: datetime,
    ):

        statement = (
            select(
                func.count(
                    Booking.id
                ).label(
                    "total_bookings",
                ),
                func.sum(
                    case(
                        (
                            Booking.status
                            == BookingStatus.CONFIRMED,
                            1,
                        ),
                        else_=0,
                    )
                ).label(
                    "confirmed_bookings",
                ),
                func.sum(
                    case(
                        (
                            Booking.status
                            == BookingStatus.CANCELLED,
                            1,
                        ),
                        else_=0,
                    )
                ).label(
                    "cancelled_bookings",
                ),
            )
            .where(
                Booking.start_time >= start_date,
                Booking.start_time < end_date,
            )
        )

        return self.db.execute(
            statement,
        ).one()