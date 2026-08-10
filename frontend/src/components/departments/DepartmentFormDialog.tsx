import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert,
} from '@mui/material'
import type { Department } from '@/types/models'
import { departmentsApi } from '@/api/departments'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  department: Department | null
  onClose: () => void
  onSaved: () => void
}

export default function DepartmentFormDialog({ open, department, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (department) {
      setForm({ name: department.name, description: department.description ?? '' })
    } else {
      setForm({ name: '', description: '' })
    }
    setError(null)
  }, [department, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { name: form.name, description: form.description || null }
      if (department) {
        await departmentsApi.update(department.id, payload)
      } else {
        await departmentsApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save department.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{department ? 'Edit Department' : 'New Department'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Department name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
