import { Box, Typography } from '@mui/material'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

export default function EmptyState({ message = 'No records found' }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        color: 'text.secondary',
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 42, mb: 1, opacity: 0.5 }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  )
}
