import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Link,
} from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoomOutlined'
import { authApi } from '@/api/auth'
import { departmentsApi } from '@/api/departments'
import type { Department } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState<Department[]>([])
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then(setDepartments).catch(() => setDepartments([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        department_id: Number(form.department_id),
        password: form.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create your account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 460, p: 4 }} elevation={0} variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MeetingRoomIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            Create your account
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          New accounts are created with Employee access.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Account created! Redirecting to sign in…</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="First name"
              fullWidth
              required
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <TextField
              label="Last name"
              fullWidth
              required
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Box>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            select
            label="Department"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            helperText="At least 8 characters"
            sx={{ mb: 3 }}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
