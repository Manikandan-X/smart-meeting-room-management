from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    ValidationException,
)
from app.models.user import User    
from app.models.booking import Booking
from app.models.booking_recurrence import BookingRecurrence
from app.models.enums import (
    BookingStatus,
    RecurrenceType,
)
from app.models.booking_resource import (
    BookingResource,
)
from app.repositories.notification_repository import (
    NotificationRepository,
)

from app.services.notification_service import (
    NotificationService,
)
from app.repositories.booking_repository import BookingRepository
from app.repositories.booking_recurrence_repository import (
    BookingRecurrenceRepository,
)
from app.repositories.meeting_room_repository import (
    MeetingRoomRepository,
)
from app.repositories.resource_repository import (
    ResourceRepository,
)
from app.repositories.room_resource_repository import (
    RoomResourceRepository,
)
from app.repositories.user_repository import UserRepository

from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
)
from app.utils.audit_logger import log_audit


class BookingService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

        self.booking_repository = (
            BookingRepository(db)
        )

        self.recurrence_repository = (
            BookingRecurrenceRepository(db)
        )

        self.user_repository = (
            UserRepository(db)
        )

        self.meeting_room_repository = (
            MeetingRoomRepository(db)
        )

        self.room_resource_repository = (
            RoomResourceRepository(db)
        )

        self.resource_repository = (
            ResourceRepository(db)
        )
        
        self.notification_service = NotificationService(
            NotificationRepository(db),
        )

    def _check_booking_permission(
        self,
        booking: Booking,
        current_user: User,
    ) -> None:

        if (
            current_user.role.name
            == "Admin"
        ):
            return

        if (
            booking.user_id
            != current_user.id
        ):
            raise ConflictException(
                "You are not allowed to modify this booking."
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
        
    def _validate_booking_time(
        self,
        start_time: datetime,
        end_time: datetime,
    ) -> None:

        now = datetime.now(
            timezone.utc,
        )

        if start_time >= end_time:
            raise ValidationException(
                "End time must be greater than start time."
            )

        if start_time < now:
            raise ValidationException(
                "Booking cannot be created in the past."
            )

    def _validate_room(
        self,
        meeting_room_id: int,
    ):

        room = (
            self.meeting_room_repository
            .get_meeting_room_by_id(
                meeting_room_id
            )
        )

        if not room:
            raise NotFoundException(
                "Meeting Room"
            )

        return room

    def _check_room_conflict(
        self,
        meeting_room_id: int,
        start_time: datetime,
        end_time: datetime,
    ) -> None:

        conflict = (
            self.booking_repository
            .get_room_conflict(
                meeting_room_id,
                start_time,
                end_time,
            )
        )

        if conflict:
            raise ConflictException(
                "Meeting room is already booked for the selected time."
            )

    def _create_recurrence(
        self,
        booking_data: BookingCreate,
    ) -> BookingRecurrence | None:

        if (
            booking_data.recurrence_type
            == RecurrenceType.NONE
        ):
            return None

        if (
            booking_data.recurrence_end_date
            is None
        ):
            raise ValidationException(
                "Recurrence end date is required."
            )

        if (
            booking_data.recurrence_end_date
            <= booking_data.end_time
        ):
            raise ValidationException(
                "Recurrence end date must be after booking end time."
            )

        recurrence = BookingRecurrence(
            recurrence_type=(
                booking_data.recurrence_type
            ),
            end_date=self._ensure_utc(
                booking_data.recurrence_end_date,
            ),
        )

        return (
            self.recurrence_repository
            .create_recurrence(
                recurrence
            )
        )

    def _get_next_occurrence(
        self,
        current: datetime,
        recurrence_type: RecurrenceType,
    ) -> datetime:

        if (
            recurrence_type
            == RecurrenceType.DAILY
        ):
            return current + timedelta(
                days=1,
            )

        if (
            recurrence_type
            == RecurrenceType.WEEKLY
        ):
            return current + timedelta(
                weeks=1,
            )

        if (
            recurrence_type
            == RecurrenceType.MONTHLY
        ):
            # Simple monthly increment.
            # Can be improved later with dateutil.
            return current + timedelta(
                days=30,
            )

        return current
    
    def create_booking(
        self,
        user_id: int,
        booking_data: BookingCreate,
    ) -> Booking:

        user = self.user_repository.get_user_by_id(
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User",
            )

        # Convert incoming datetimes to UTC
        start_time = self._ensure_utc(
            booking_data.start_time,
        )

        end_time = self._ensure_utc(
            booking_data.end_time,
        )

        self._validate_booking_time(
            start_time,
            end_time,
        )

        room = self._validate_room(
            booking_data.meeting_room_id,
        )

        self._check_room_conflict(
            room.id,
            start_time,
            end_time,
        )

        self._check_resource_conflicts(
            room.id,
            start_time,
            end_time,
            booking_data.resources,
        )

        recurrence = self._create_recurrence(
            booking_data,
        )

        booking = Booking(
            user_id=user.id,
            meeting_room_id=room.id,
            recurrence_id=(
                recurrence.id
                if recurrence
                else None
            ),
            title=booking_data.title.strip(),
            description=(
                booking_data.description.strip()
                if booking_data.description
                else None
            ),
            start_time=start_time,
            end_time=end_time,
            status=BookingStatus.CONFIRMED,
        )

        # Add requested resources
        for requested_resource in (
            booking_data.resources
        ):

            booking_resource = BookingResource(
                booking=booking,
                resource_id=(
                    requested_resource.resource_id
                ),
                quantity=(
                    requested_resource.quantity
                ),
            )

            self.db.add(
                booking_resource,
            )

        # Normal booking
        if recurrence is None:

            booking = (
                self.booking_repository
                .create_booking(
                    booking,
                )
            )

            self.notification_service.create_booking_confirmation(
                user_id=booking.user_id,
                booking_id=booking.id,
            )
            
            self.notification_service.schedule_meeting_reminder(
                user_id=booking.user_id,
                booking_id=booking.id,
                meeting_start_time=booking.start_time,
            )

            log_audit(
                db=self.db,
                user_id=user_id,
                action="CREATE",
                entity_type="Booking",
                entity_id=booking.id,
                description=(
                    f"Created booking "
                    f"'{booking.title}'"
                ),
            )

            return booking

        # Recurring booking
        self.booking_repository.create_booking_without_commit(
            booking,
        )

        self._generate_recurring_bookings(
            booking,
            recurrence,
        )

        self.db.commit()

        self.db.refresh(
            booking,
        )

        self.notification_service.create_booking_confirmation(
            user_id=booking.user_id,
            booking_id=booking.id,
        )

        log_audit(
            db=self.db,
            user_id=user_id,
            action="CREATE",
            entity_type="Booking",
            entity_id=booking.id,
            description=(
                f"Created recurring booking "
                f"'{booking.title}'"
            ),
        )

        return booking
    
    def _check_resource_conflicts(
        self,
        meeting_room_id: int,
        start_time: datetime,
        end_time: datetime,
        resources: list,
        exclude_booking_id: int | None = None,
    ) -> None:

        for requested_resource in resources:

            resource = (
                self.resource_repository
                .get_resource_by_id(
                    requested_resource.resource_id,
                )
            )

            if not resource:
                raise NotFoundException(
                    "Resource",
                )

            if not resource.is_available:
                raise ConflictException(
                    f"Resource '{resource.name}' "
                    "is unavailable."
                )

            room_resource = (
                self.room_resource_repository
                .get_room_resource(
                    meeting_room_id,
                    requested_resource.resource_id,
                )
            )

            if not room_resource:
                raise ValidationException(
                    f"Resource '{resource.name}' "
                    "is not assigned to this meeting room."
                )

            if (
                requested_resource.quantity
                > resource.quantity
            ):
                raise ValidationException(
                    f"Requested quantity for "
                    f"'{resource.name}' exceeds "
                    "the total available quantity."
                )

            conflicting_bookings = (
                self.booking_repository
                .get_resource_booking_conflicts(
                    start_time,
                    end_time,
                    exclude_booking_id,
                )
            )

            used_quantity = 0

            for booking in conflicting_bookings:

                if (
                    booking.meeting_room_id
                    != meeting_room_id
                ):
                    continue

                for booking_resource in (
                    booking.booking_resources
                ):

                    if (
                        booking_resource.resource_id
                        == requested_resource.resource_id
                    ):
                        used_quantity += (
                            booking_resource.quantity
                        )

            available_quantity = (
                resource.quantity
                - used_quantity
            )

            if (
                requested_resource.quantity
                > available_quantity
            ):
                raise ConflictException(
                    f"Not enough '{resource.name}' "
                    "available for the selected time."
                )
      
    def _get_booked_resource_quantity(
        self,
        booking_id: int,
        resource_id: int,
    ) -> int:

        booking = (
            self.booking_repository
            .get_booking_by_id(
                booking_id,
            )
        )

        if not booking:
            return 0

        for booking_resource in (
            booking.booking_resources
        ):

            if (
                booking_resource.resource_id
                == resource_id
            ):
                return booking_resource.quantity

        return 0
    
    def _generate_recurring_bookings(
        self,
        first_booking: Booking,
        recurrence: BookingRecurrence,
    ) -> None:

        current_start = self._ensure_utc(
            first_booking.start_time,
        )

        current_end = self._ensure_utc(
            first_booking.end_time,
        )

        recurrence_end_date = self._ensure_utc(
            recurrence.end_date,
        )

        while True:

            current_start = (
                self._get_next_occurrence(
                    current_start,
                    recurrence.recurrence_type,
                )
            )

            current_end = (
                self._get_next_occurrence(
                    current_end,
                    recurrence.recurrence_type,
                )
            )

            if (
                current_start
                > recurrence_end_date
            ):
                break

            self._check_room_conflict(
                first_booking.meeting_room_id,
                current_start,
                current_end,
            )

            self._check_resource_conflicts(
                first_booking.meeting_room_id,
                current_start,
                current_end,
                first_booking.booking_resources,
            )

            booking = Booking(
                user_id=first_booking.user_id,
                meeting_room_id=(
                    first_booking.meeting_room_id
                ),
                recurrence_id=(
                    recurrence.id
                ),
                title=first_booking.title,
                description=(
                    first_booking.description
                ),
                start_time=current_start,
                end_time=current_end,
                status=BookingStatus.CONFIRMED,
            )
            
            for booking_resource in (
                first_booking.booking_resources
            ):

                recurring_resource = BookingResource(
                    booking=booking,
                    resource_id=(
                        booking_resource.resource_id
                    ),
                    quantity=(
                        booking_resource.quantity
                    ),
                )

                self.db.add(
                    recurring_resource,
                )

            self.booking_repository.create_booking_without_commit(
                booking,
            )
            self.notification_service.schedule_meeting_reminder(
                user_id=booking.user_id,
                booking_id=booking.id,
                meeting_start_time=booking.start_time,
            )
            
    def get_booking(
        self,
        booking_id: int,
    ) -> Booking:

        booking = (
            self.booking_repository
            .get_booking_by_id(
                booking_id,
            )
        )

        if not booking:
            raise NotFoundException(
                "Booking",
            )

        return booking
    
    def get_bookings(
        self,
        current_user: User,
        search: str | None = None,
        status: BookingStatus | None = None,
        meeting_room_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Booking]:

        user_id = None

        if current_user.role.name != "Admin":
            user_id = current_user.id

        return self.booking_repository.get_bookings(
            search=search,
            status=status,
            meeting_room_id=meeting_room_id,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id,
            skip=skip,
            limit=limit,
        )
        
    def update_booking(
        self,
        booking_id: int,
        booking_data: BookingUpdate,
        current_user: User,
    ) -> Booking:

        booking = (
            self.booking_repository
            .get_booking_by_id(
                booking_id,
            )
        )

        if not booking:
            raise NotFoundException(
                "Booking",
            )

        self._check_booking_permission(
            booking,
            current_user,
        )

        if (
            booking.status
            == BookingStatus.CANCELLED
        ):
            raise ValidationException(
                "Cancelled bookings cannot be updated."
            )

        update_data = booking_data.model_dump(
            exclude_unset=True,
            exclude={"resources"},
        )

        meeting_room_id = update_data.get(
            "meeting_room_id",
            booking.meeting_room_id,
        )

        start_time = update_data.get(
            "start_time",
            booking.start_time,
        )

        end_time = update_data.get(
            "end_time",
            booking.end_time,
        )

        if start_time >= end_time:
            raise ValidationException(
                "Start time must be before end time."
            )

        room = (
            self.meeting_room_repository
            .get_meeting_room_by_id(
                meeting_room_id,
            )
        )

        if not room:
            raise NotFoundException(
                "Meeting Room",
            )

        # Check room conflict
        room_conflict = (
            self.booking_repository
            .get_room_conflict_excluding_booking(
                booking_id,
                meeting_room_id,
                start_time,
                end_time,
            )
        )

        if room_conflict:
            raise ConflictException(
                "Meeting room is already booked "
                "for the selected time."
            )

        # Check whether resources were provided
        if "resources" in booking_data.model_fields_set:

            resources = booking_data.resources or []

            self._check_resource_conflicts(
                meeting_room_id,
                start_time,
                end_time,
                resources,
                exclude_booking_id=booking_id,
            )

            # Remove old booking resources
            for booking_resource in list(
                booking.booking_resources
            ):
                self.db.delete(
                    booking_resource,
                )

            # Add newly requested resources
            for requested_resource in resources:

                booking_resource = BookingResource(
                    booking=booking,
                    resource_id=(
                        requested_resource.resource_id
                    ),
                    quantity=(
                        requested_resource.quantity
                    ),
                )

                self.db.add(
                    booking_resource,
                )

        # Update normal booking fields
        if update_data:
            self.booking_repository.update_booking(
                booking,
                update_data,
            )
        else:
            self.db.commit()
            self.db.refresh(booking)

        log_audit(
            db=self.db,
            user_id=current_user.id,
            action="UPDATE",
            entity_type="Booking",
            entity_id=booking.id,
            description=(
                f"Updated booking "
                f"'{booking.title}'"
            ),
        )

        return booking
        
    def delete_booking(
        self,
        booking_id: int,
        current_user: User,
    ) -> dict:

        booking = (
            self.booking_repository
            .get_booking_by_id(
                booking_id,
            )
        )

        if not booking:
            raise NotFoundException(
                "Booking",
            )
            
        self._check_booking_permission(
            booking,
            current_user,
        )

        if (
            booking.status
            == BookingStatus.CANCELLED
        ):
            raise ValidationException(
                "Booking is already cancelled."
            )

        self.booking_repository.update_booking(
            booking,
            {
                "status": BookingStatus.CANCELLED,
            },
        )

        self.notification_service.create_booking_cancellation(
            user_id=booking.user_id,
            booking_id=booking.id,
        )

        log_audit(
            db=self.db,
            user_id=current_user.id,
            action="CANCEL",
            entity_type="Booking",
            entity_id=booking.id,
            description=(
                f"Cancelled booking "
                f"'{booking.title}'"
            ),
        )

        return {
            "message": (
                "Booking cancelled successfully."
            )
        }