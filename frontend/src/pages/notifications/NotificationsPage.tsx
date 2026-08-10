import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  MenuItem,
  TextField,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { format } from 'date-fns'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { notificationsApi } from '@/api/notifications'
import type { Notification } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function NotificationsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationsApi.list({
        is_read: readFilter === 'all' ? undefined : readFilter === 'read',
        limit: 100,
      })
      setItems(data)
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    }
  }

  return (
    <Box>
      <PageHeader title="Notifications" subtitle="Booking confirmations, reminders and cancellations." />

      <Stack direction="row" sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Filter"
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value as typeof readFilter)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="unread">Unread</MenuItem>
          <MenuItem value="read">Read</MenuItem>
        </TextField>
      </Stack>

      {!loading && items.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <Stack spacing={1.5}>
          {items.map((n) => (
            <Card key={n.id} variant="outlined">
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography fontWeight={700} variant="body1">
                      {n.title}
                    </Typography>
                    {!n.is_read && <Chip label="New" color="primary" size="small" />}
                    <Chip label={n.notification_type} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {format(new Date(n.created_at), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
                {!n.is_read && (
                  <Button size="small" onClick={() => handleMarkRead(n.id)}>
                    Mark as read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
