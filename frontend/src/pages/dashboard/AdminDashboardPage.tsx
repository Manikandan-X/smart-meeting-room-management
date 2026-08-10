import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { format, startOfMonth, subDays } from 'date-fns'
import PageHeader from '@/components/common/PageHeader'
import StatusChip from '@/components/common/StatusChip'
import EmptyState from '@/components/common/EmptyState'
import { dashboardApi } from '@/api/dashboard'
import type {
  MonthlyBookingReport,
  ResourceUsage,
  RoomUtilization,
  UpcomingMeeting,
} from '@/types/models'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function AdminDashboardPage() {
  const [meetings, setMeetings] = useState<UpcomingMeeting[]>([])
  const [utilization, setUtilization] = useState<RoomUtilization[]>([])
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([])
  const [monthlyReport, setMonthlyReport] = useState<MonthlyBookingReport | null>(null)

  const now = useMemo(() => new Date(), [])

  useEffect(() => {
    const startDate = subDays(now, 30).toISOString()
    const endDate = now.toISOString()
    const monthStart = startOfMonth(now)

    Promise.all([
      dashboardApi.upcomingMeetings(6),
      dashboardApi.roomUtilization(startDate, endDate),
      dashboardApi.resourceUsage(startDate, endDate),
      dashboardApi.monthlyBookingReport(monthStart.getFullYear(), monthStart.getMonth() + 1),
    ]).then(([m, u, r, mr]) => {
      setMeetings(m)
      setUtilization(u)
      setResourceUsage(r)
      setMonthlyReport(mr)
    })
  }, [now])

  const utilizationData = {
    labels: utilization.map((u) => u.room_name),
    datasets: [
      {
        label: 'Utilization %',
        data: utilization.map((u) => u.utilization_percentage),
        backgroundColor: '#3454D1',
        borderRadius: 6,
      },
    ],
  }

  const resourceData = {
    labels: resourceUsage.map((r) => r.resource_name),
    datasets: [
      {
        label: 'Bookings using resource',
        data: resourceUsage.map((r) => r.booking_count),
        backgroundColor: [
          '#3454D1',
          '#00B4A0',
          '#E0A22C',
          '#D64545',
          '#6C7FE0',
          '#2E9E5B',
        ],
      },
    ],
  }

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Organization-wide overview of rooms, resources and bookings."
      />

      {monthlyReport && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Bookings ({monthlyReport.month})
                </Typography>
                <Typography variant="h4">{monthlyReport.total_bookings}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Confirmed Bookings
                </Typography>
                <Typography variant="h4" color="success.main">
                  {monthlyReport.confirmed_bookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Cancelled Bookings
                </Typography>
                <Typography variant="h4" color="error.main">
                  {monthlyReport.cancelled_bookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Room Utilization (last 30 days)
              </Typography>
              {utilization.length === 0 ? (
                <EmptyState message="Not enough data yet." />
              ) : (
                <Bar
                  data={utilizationData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { max: 100 } },
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resource Usage (last 30 days)
              </Typography>
              {resourceUsage.length === 0 ? (
                <EmptyState message="Not enough data yet." />
              ) : (
                <Doughnut data={resourceData} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upcoming Meetings (organization-wide)
          </Typography>
          {meetings.length === 0 ? (
            <EmptyState message="No upcoming meetings." />
          ) : (
            <Stack spacing={1.5}>
              {meetings.map((m) => (
                <Stack
                  key={m.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Box>
                    <Typography fontWeight={600} variant="body2">
                      {m.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(m.start_time), 'MMM d, h:mm a')} –{' '}
                      {format(new Date(m.end_time), 'h:mm a')}
                    </Typography>
                  </Box>
                  <StatusChip status={m.status} />
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
