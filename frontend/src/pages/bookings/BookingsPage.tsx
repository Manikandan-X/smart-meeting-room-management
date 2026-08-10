import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Popover,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import ViewListIcon from "@mui/icons-material/ViewListOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import BookingFormDialog from "@/components/bookings/BookingFormDialog";
import BookingDetailsCard from "@/components/bookings/BookingDetailsCard";
import { bookingsApi } from "@/api/bookings";
import { meetingRoomsApi } from "@/api/meetingRooms";
import { resourcesApi } from "@/api/resources";
import type { Booking, MeetingRoom, Resource } from "@/types/models";
import { BookingStatus } from "@/types/enums";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

const statusColorMap: Record<string, string> = {
  Pending: "#E0A22C",
  Confirmed: "#2E9E5B",
  Cancelled: "#D64545",
  Completed: "#6C7FE0",
};

export default function BookingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin, user } = useAuth();

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>(
    "all",
  );
  const [roomFilter, setRoomFilter] = useState<"all" | number>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [defaultRange, setDefaultRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverBooking, setPopoverBooking] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, r, res] = await Promise.all([
        bookingsApi.list({
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          meeting_room_id: roomFilter === "all" ? undefined : roomFilter,
          limit: 200,
        }),
        meetingRoomsApi.list({ limit: 100 }),
        resourcesApi.list({ limit: 100 }),
      ]);
      setBookings(b);
      setRooms(r);
      setResources(res);
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: "error" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, roomFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const events = useMemo(
    () =>
      bookings.map((b) => ({
        id: String(b.id),
        title: b.title,
        start: b.start_time,
        end: b.end_time,
        backgroundColor: statusColorMap[b.status] ?? "#3454D1",
        borderColor: statusColorMap[b.status] ?? "#3454D1",
        extendedProps: { booking: b },
      })),
    [bookings],
  );

  const canManage = (b: Booking) => isAdmin || b.user_id === user?.id;

  const handleEventClick = (info: EventClickArg) => {
    const booking = info.event.extendedProps.booking as Booking;
    setPopoverBooking(booking);
    setPopoverAnchor(info.el as unknown as HTMLElement);
  };

  const handleSelect = (info: DateSelectArg) => {
    setEditing(null);
    setDefaultRange({ start: info.start, end: info.end });
    setFormOpen(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await bookingsApi.cancel(cancelTarget.id);
      enqueueSnackbar("Booking cancelled.", { variant: "success" });
      setCancelTarget(null);
      setPopoverAnchor(null);
      load();
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: "error" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Bookings"
        subtitle={
          isAdmin
            ? "View and manage all meeting room bookings."
            : "View and manage your meeting room bookings."
        }
        actions={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_e, v) => v && setView(v)}
            >
              <ToggleButton value="calendar">
                <CalendarViewMonthIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setDefaultRange(null);
                setFormOpen(true);
              }}
              sx={{
                backgroundColor: "#c33535",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#a82d2d",
                },
              }}
            >
              New Booking
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search bookings..."
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All statuses</MenuItem>
          {Object.values(BookingStatus).map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Room"
          value={roomFilter}
          onChange={(e) =>
            setRoomFilter(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All rooms</MenuItem>
          {rooms.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: view === "calendar" ? 2 : 0,
        }}
      >
        {view === "calendar" ? (
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            height="auto"
            selectable
            events={events}
            eventClick={handleEventClick}
            select={handleSelect}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>
                    {rooms.find((r) => r.id === b.meeting_room_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.start_time), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.end_time), "h:mm a")}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={b.status} />
                  </TableCell>
                  <TableCell align="right">
                    {canManage(b) &&
                      b.status !== "Cancelled" &&
                      b.status !== "Completed" && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(b);
                              setDefaultRange(null);
                              setFormOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setCancelTarget(b)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      <Popover
        open={Boolean(popoverAnchor && popoverBooking)}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
      >
        {popoverBooking && (
          <BookingDetailsCard
            booking={popoverBooking}
            rooms={rooms}
            resources={resources}
            canManage={canManage(popoverBooking)}
            onEdit={() => {
              setEditing(popoverBooking);
              setDefaultRange(null);
              setFormOpen(true);
              setPopoverAnchor(null);
            }}
            onCancel={() => setCancelTarget(popoverBooking)}
          />
        )}
      </Popover>

      <BookingFormDialog
        open={formOpen}
        booking={editing}
        rooms={rooms}
        resources={resources}
        defaultStart={defaultRange?.start}
        defaultEnd={defaultRange?.end}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
          enqueueSnackbar(editing ? "Booking updated." : "Booking created.", {
            variant: "success",
          });
        }}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel booking?"
        message={`This will cancel "${cancelTarget?.title}". Attendees will be notified.`}
        confirmLabel="Cancel Booking"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </Box>
  );
}
