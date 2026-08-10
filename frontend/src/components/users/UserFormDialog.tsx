import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert, MenuItem,
} from '@mui/material'
import type { User, Role, Department } from '@/types/models'
import { usersApi } from '@/api/users'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  user: User | null
  roles: Role[]
  departments: Department[]
  onClose: () => void
  onSaved: () => void
}

export default function UserFormDialog({ open, user, roles, departments, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', role_id: '', department_id: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: String(user.role_id),
        department_id: String(user.department_id),
      })
    }
    setError(null)
  }, [user, open])

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await usersApi.update(user.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role_id: Number(form.role_id),
        department_id: Number(form.department_id),
      })
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save user.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First name"
                required
                fullWidth
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <TextField
                label="Last name"
                required
                fullWidth
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Stack>
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              select
              label="Role"
              required
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Department"
              required
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
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
