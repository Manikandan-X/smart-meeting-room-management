import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert, MenuItem,
} from '@mui/material'
import type { RoomResource, MeetingRoom, Resource } from '@/types/models'
import { roomResourcesApi } from '@/api/roomResources'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  roomResource: RoomResource | null
  rooms: MeetingRoom[]
  resources: Resource[]
  onClose: () => void
  onSaved: () => void
}

export default function RoomResourceFormDialog({
  open, roomResource, rooms, resources, onClose, onSaved,
}: Props) {
  const [form, setForm] = useState({ meeting_room_id: '', resource_id: '', quantity: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (roomResource) {
      setForm({
        meeting_room_id: String(roomResource.meeting_room_id),
        resource_id: String(roomResource.resource_id),
        quantity: String(roomResource.quantity),
      })
    } else {
      setForm({ meeting_room_id: '', resource_id: '', quantity: '' })
    }
    setError(null)
  }, [roomResource, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        meeting_room_id: Number(form.meeting_room_id),
        resource_id: Number(form.resource_id),
        quantity: Number(form.quantity),
      }
      if (roomResource) {
        await roomResourcesApi.update(roomResource.id, payload)
      } else {
        await roomResourcesApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save assignment.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{roomResource ? 'Edit Assignment' : 'Assign Resource to Room'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              select
              label="Meeting Room"
              required
              value={form.meeting_room_id}
              onChange={(e) => setForm({ ...form, meeting_room_id: e.target.value })}
            >
              {rooms.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Resource"
              required
              value={form.resource_id}
              onChange={(e) => setForm({ ...form, resource_id: e.target.value })}
            >
              {resources.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              required
              inputProps={{ min: 1 }}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
