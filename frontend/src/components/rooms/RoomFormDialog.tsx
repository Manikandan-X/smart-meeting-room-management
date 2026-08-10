import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material'
import type { MeetingRoom } from '@/types/models'
import { meetingRoomsApi } from '@/api/meetingRooms'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  room: MeetingRoom | null
  onClose: () => void
  onSaved: () => void
}

export default function RoomFormDialog({ open, room, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    facilities: '',
    is_available: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (room) {
      setForm({
        name: room.name,
        capacity: String(room.capacity),
        facilities: room.facilities,
        is_available: room.is_available,
      })
    } else {
      setForm({ name: '', capacity: '', facilities: '', is_available: true })
    }
    setError(null)
  }, [room, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        capacity: Number(form.capacity),
        facilities: form.facilities,
        is_available: form.is_available,
      }
      if (room) {
        await meetingRoomsApi.update(room.id, payload)
      } else {
        await meetingRoomsApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save meeting room.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{room ? 'Edit Meeting Room' : 'New Meeting Room'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Room name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              label="Capacity"
              type="number"
              required
              inputProps={{ min: 1 }}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
            <TextField
              label="Facilities"
              placeholder="Projector, TV, Whiteboard"
              required
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                />
              }
              label="Available for booking"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
