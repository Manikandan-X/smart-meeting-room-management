import { Box, Typography, Stack, Chip, Button, Divider } from '@mui/material'
import { format } from 'date-fns'
import type { Booking, MeetingRoom, Resource } from '@/types/models'
import StatusChip from '@/components/common/StatusChip'

interface Props {
  booking: Booking
  rooms: MeetingRoom[]
  resources: Resource[]
  canManage: boolean
  onEdit: () => void
  onCancel: () => void
}

export default function BookingDetailsCard({
  booking,
  rooms,
  resources,
  canManage,
  onEdit,
  onCancel,
}: Props) {
  const room = rooms.find((r) => r.id === booking.meeting_room_id)

  return (
    <Box sx={{ p: 2.5, width: 340 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {booking.title}
        </Typography>
        <StatusChip status={booking.status} />
      </Stack>
      {booking.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {booking.description}
        </Typography>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="caption" color="text.secondary">
        Room
      </Typography>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        {room?.name ?? `Room #${booking.meeting_room_id}`}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Time
      </Typography>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')} –{' '}
        {format(new Date(booking.end_time), 'h:mm a')}
      </Typography>

      {booking.recurrence_type !== 'None' && (
        <>
          <Typography variant="caption" color="text.secondary">
            Recurrence
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {booking.recurrence_type}
          </Typography>
        </>
      )}

      {booking.resources.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary">
            Resources
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, gap: 1 }}>
            {booking.resources.map((r) => {
              const res = resources.find((x) => x.id === r.resource_id)
              return (
                <Chip
                  key={r.id}
                  size="small"
                  label={`${res?.name ?? 'Resource'} x${r.quantity}`}
                />
              )
            })}
          </Stack>
        </>
      )}

      {canManage && booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" fullWidth onClick={onEdit}>
            Edit
          </Button>
          <Button size="small" variant="outlined" color="error" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      )}
    </Box>
  )
}
