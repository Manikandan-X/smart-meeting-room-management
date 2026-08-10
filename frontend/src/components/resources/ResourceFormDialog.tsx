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
import type { Resource } from '@/types/models'
import { resourcesApi } from '@/api/resources'
import { getApiErrorMessage } from '@/api/client'

interface Props {
  open: boolean
  resource: Resource | null
  onClose: () => void
  onSaved: () => void
}

export default function ResourceFormDialog({ open, resource, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: '', quantity: '', is_available: true })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (resource) {
      setForm({
        name: resource.name,
        quantity: String(resource.quantity),
        is_available: resource.is_available,
      })
    } else {
      setForm({ name: '', quantity: '', is_available: true })
    }
    setError(null)
  }, [resource, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        quantity: Number(form.quantity),
        is_available: form.is_available,
      }
      if (resource) {
        await resourcesApi.update(resource.id, payload)
      } else {
        await resourcesApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save resource.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{resource ? 'Edit Resource' : 'New Resource'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Resource name"
              placeholder="Projector"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              label="Quantity"
              type="number"
              required
              inputProps={{ min: 1 }}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                   sx={{
                    // ON state
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#c33535",
                    },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#c33535",
                      opacity: 1,
                    },

                    // OFF state
                    "& .MuiSwitch-track": {
                      backgroundColor: "#999999",
                    },

                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#ffffff",
                    },

                    // ON hover
                    "& .MuiSwitch-switchBase.Mui-checked:hover": {
                      backgroundColor: "rgba(195, 53, 53, 0.08)",
                    },
                  }}
                />
              }
              label="Available"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}
           sx={{
                backgroundColor: "#ffff",
                color: "#c33535",
                "&:hover": {
                  backgroundColor: "#ffffff",
                },
              }}  >Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} 
          sx={{
                backgroundColor: "#c33535",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#a82d2d",
                },
              }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
