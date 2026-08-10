import { Box, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        404
      </Typography>
      <Typography color="text.secondary">
        The page you're looking for doesn't exist.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to Dashboard
      </Button>
    </Box>
  )
}
