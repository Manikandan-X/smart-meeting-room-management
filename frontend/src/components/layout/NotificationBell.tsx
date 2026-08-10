import { useEffect, useState } from 'react'
import {
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  Divider,
  MenuItem,
  Button,
} from '@mui/material'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notifications'
import type { Notification } from '@/types/models'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [items, setItems] = useState<Notification[]>([])
  const navigate = useNavigate()

  const loadUnread = async () => {
    try {
      const data = await notificationsApi.unread()
      setItems(data)
    } catch {
      // silent fail - non-critical widget
    }
  }

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: number) => {
    await notificationsApi.markAsRead(id)
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={items.length} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxHeight: 420 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {items.length === 0 && (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You're all caught up.
            </Typography>
          </Box>
        )}
        {items.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            sx={{ whiteSpace: 'normal', alignItems: 'flex-start', py: 1 }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {n.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {n.message}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              setAnchorEl(null)
              navigate('/notifications')
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  )
}
