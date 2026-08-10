import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import type { Booking, MeetingRoom, Resource } from '@/types/models'
import { RecurrenceType } from '@/types/enums'
import { bookingsApi } from '@/api/bookings'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  booking: Booking | null
  rooms: MeetingRoom[]
  resources: Resource[]
  defaultStart?: Date | null
  defaultEnd?: Date | null
  onClose: () => void
  onSaved: () => void
}

interface ResourceLine {
  resource_id: string
  quantity: string
}

export default function BookingFormDialog({
  open,
  booking,
  rooms,
  resources,
  defaultStart,
  defaultEnd,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    meeting_room_id: '',
    title: '',
    description: '',
    start_time: null as Date | null,
    end_time: null as Date | null,
    recurrence_type: RecurrenceType.NONE as string,
    recurrence_end_date: null as Date | null,
  })
  const [resourceLines, setResourceLines] = useState<ResourceLine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (booking) {
      setForm({
        meeting_room_id: String(booking.meeting_room_id),
        title: booking.title,
        description: booking.description ?? '',
        start_time: new Date(booking.start_time),
        end_time: new Date(booking.end_time),
        recurrence_type: booking.recurrence_type,
        recurrence_end_date: booking.recurrence_end_date
          ? new Date(booking.recurrence_end_date)
          : null,
      })
      setResourceLines(
        booking.resources.map((r) => ({
          resource_id: String(r.resource_id),
          quantity: String(r.quantity),
        })),
      )
    } else {
      setForm({
        meeting_room_id: '',
        title: '',
        description: '',
        start_time: defaultStart ?? null,
        end_time: defaultEnd ?? null,
        recurrence_type: RecurrenceType.NONE,
        recurrence_end_date: null,
      })
      setResourceLines([])
    }
    setError(null)
  }, [booking, open, defaultStart, defaultEnd])

  const addResourceLine = () =>
    setResourceLines((prev) => [...prev, { resource_id: '', quantity: '1' }])

  const removeResourceLine = (idx: number) =>
    setResourceLines((prev) => prev.filter((_, i) => i !== idx))

  const updateResourceLine = (idx: number, patch: Partial<ResourceLine>) =>
    setResourceLines((prev) =>
      prev.map((line, i) => (i === idx ? { ...line, ...patch } : line)),
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.start_time || !form.end_time) {
      setError('Please select a start and end time.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        meeting_room_id: Number(form.meeting_room_id),
        title: form.title,
        description: form.description || null,
        start_time: form.start_time.toISOString(),
        end_time: form.end_time.toISOString(),
        recurrence_type: form.recurrence_type as typeof RecurrenceType[keyof typeof RecurrenceType],
        recurrence_end_date: form.recurrence_end_date
          ? form.recurrence_end_date.toISOString()
          : null,
        resources: resourceLines
          .filter((l) => l.resource_id)
          .map((l) => ({
            resource_id: Number(l.resource_id),
            quantity: Number(l.quantity || 1),
          })),
      }

      if (booking) {
        await bookingsApi.update(booking.id, payload)
      } else {
        await bookingsApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save booking.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{booking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        <Stack component="form" onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
              <TextField
                label="Description"
                multiline
                minRows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <TextField
                select
                label="Meeting Room"
                required
                value={form.meeting_room_id}
                onChange={(e) => setForm({ ...form, meeting_room_id: e.target.value })}
              >
                {rooms.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} (capacity {r.capacity})
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DateTimePicker
                  label="Start time"
                  value={form.start_time}
                  onChange={(v) => setForm({ ...form, start_time: v })}
                  sx={{ width: '100%' }}
                />
                <DateTimePicker
                  label="End time"
                  value={form.end_time}
                  onChange={(v) => setForm({ ...form, end_time: v })}
                  sx={{ width: '100%' }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Recurrence"
                  value={form.recurrence_type}
                  onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })}
                  sx={{ width: '100%' }}
                >
                  {Object.values(RecurrenceType).map((rt) => (
                    <MenuItem key={rt} value={rt}>
                      {rt}
                    </MenuItem>
                  ))}
                </TextField>
                {form.recurrence_type !== RecurrenceType.NONE && (
                  <DateTimePicker
                    label="Recurrence end date"
                    value={form.recurrence_end_date}
                    onChange={(v) => setForm({ ...form, recurrence_end_date: v })}
                    sx={{ width: '100%' }}
                  />
                )}
              </Stack>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Resources</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={addResourceLine}>
                    Add resource
                  </Button>
                </Stack>
                {resourceLines.length === 0 && (
                  <Chip label="No resources requested" size="small" variant="outlined" />
                )}
                <Stack spacing={1.5}>
                  {resourceLines.map((line, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="center">
                      <TextField
                        select
                        label="Resource"
                        size="small"
                        fullWidth
                        value={line.resource_id}
                        onChange={(e) => updateResourceLine(idx, { resource_id: e.target.value })}
                      >
                        {resources.map((r) => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Qty"
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                        sx={{ width: 100 }}
                        value={line.quantity}
                        onChange={(e) => updateResourceLine(idx, { quantity: e.target.value })}
                      />
                      <IconButton size="small" onClick={() => removeResourceLine(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Save Booking'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </LocalizationProvider>
  )
}
