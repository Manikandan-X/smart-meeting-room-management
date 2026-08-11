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
    departmentsApi
      .listPublic()
      .then(setDepartments)
      .catch(() => setDepartments([]))
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
      setError(
        getApiErrorMessage(
          err,
          'Could not create your account.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#ffffff',

    '& .MuiInputBase-input': {
      color: '#000000',
    },

    '& .MuiInputLabel-root': {
      color: '#333333',
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: '#c33535',
    },

    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#dddddd',
      },

      '&:hover fieldset': {
        borderColor: '#c33535',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#c33535',
      },
    },
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
      <Paper
        sx={{
          width: '100%',
          maxWidth: 460,
          p: 4,
          bgcolor: '#e56d6d',
        }}
        elevation={0}
        variant="outlined"
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            color: '#ffffff',
          }}
        >
          <MeetingRoomIcon
            sx={{
              fontSize: 32,
              color: '#ffffff',
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Create your account
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: '#ffffff',
          }}
        >
          New accounts are created with Employee access.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created! Redirecting to sign in…
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
        >
          {/* First Name + Last Name */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="First name"
              fullWidth
              required
              value={form.first_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  first_name: e.target.value,
                })
              }
              sx={inputStyle}
            />

            <TextField
              label="Last name"
              fullWidth
              required
              value={form.last_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  last_name: e.target.value,
                })
              }
              sx={inputStyle}
            />
          </Box>

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            sx={{
              ...inputStyle,
              mb: 2,
            }}
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          {/* Department */}
          <TextField
            select
            label="Department"
            fullWidth
            required
            sx={{
              ...inputStyle,
              mb: 2,
            }}
            value={form.department_id}
            onChange={(e) =>
              setForm({
                ...form,
                department_id: e.target.value,
              })
            }
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            helperText="At least 8 characters"
            sx={{
              ...inputStyle,
              mb: 3,

              '& .MuiFormHelperText-root': {
                color: '#ffffff',
              },
            }}
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              backgroundColor: '#274528',
              color: '#ffffff',

              '&:hover': {
                backgroundColor: '#274528',
              },
            }}
          >
            {loading
              ? 'Creating account…'
              : 'Create Account'}
          </Button>
        </Box>

        {/* Login Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: '#ffffff',
          }}
        >
          Already have an account?{' '}

          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: '#30d258',
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}