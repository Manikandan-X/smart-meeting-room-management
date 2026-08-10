import { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoomOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAuth } from '@/context/AuthContext'
import { getApiErrorMessage } from '@/api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'))
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
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }} elevation={0} variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MeetingRoomIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            MeetSpace
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to manage meeting rooms and resources.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
