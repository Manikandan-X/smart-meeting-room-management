import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusChip from '@/components/common/StatusChip'
import { dashboardApi } from '@/api/dashboard'
import { bookingsApi } from '@/api/bookings'
import type { AvailableRoom, Booking } from '@/types/models'
import { useAuth } from '@/context/AuthContext'

export default function EmployeeDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<AvailableRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.availableRooms(),
      bookingsApi.list({
        start_date: new Date().toISOString(),
        limit: 6,
      }),
    ])
      .then(([availableRooms, upcoming]) => {
        setRooms(availableRooms)
        setMeetings(upcoming)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.first_name ?? ''}`}
        subtitle="Here's what's happening with your meeting rooms today."
        actions={
          <Button variant="contained" onClick={() => navigate('/bookings')}
          sx={{
                backgroundColor: "#c33535",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#a82d2d",
                },
              }}  >
            + New Booking
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Upcoming Meetings
              </Typography>
              {meetings.length === 0 ? (
                <EmptyState message="No upcoming meetings. Book a room to get started." />
              ) : (
                <Stack spacing={1.5}>
                  {meetings.map((m) => (
                    <Box
                      key={m.id}
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={600}>{m.title}</Typography>
                        <StatusChip status={m.status} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(m.start_time), 'MMM d, h:mm a')} —{' '}
                        {format(new Date(m.end_time), 'h:mm a')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Available Rooms Right Now
              </Typography>
              {!loading && rooms.length === 0 ? (
                <EmptyState message="No rooms available." />
              ) : (
                <Stack spacing={1.5}>
                  {rooms.slice(0, 6).map((r) => (
                    <Stack
                      key={r.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600} variant="body2">
                          {r.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Capacity {r.capacity} • {r.facilities}
                        </Typography>
                      </Box>
                      <Chip label="Available" color="success" size="small" />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
