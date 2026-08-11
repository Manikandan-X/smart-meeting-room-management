import { useEffect, useState, useCallback } from 'react'
import { Box, Button, Stack, MenuItem, TextField } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import { useSnackbar } from 'notistack'
import { format } from 'date-fns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import PageHeader from '@/components/common/PageHeader'
import StatusChip from '@/components/common/StatusChip'
import { reportsApi } from '@/api/reports'
import { meetingRoomsApi } from '@/api/meetingRooms'
import type { BookingHistory, MeetingRoom } from '@/types/models'
import { BookingStatus } from '@/types/enums'
import { getApiErrorMessage } from '@/api/client'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<BookingHistory[]>([])
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const [status, setStatus] = useState<'all' | BookingStatus>('all')
  const [roomId, setRoomId] = useState<'all' | number>('all')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const filterParams = {
    status: status === 'all' ? undefined : status,
    meeting_room_id: roomId === 'all' ? undefined : roomId,
    start_date: startDate ? startDate.toISOString() : undefined,
    end_date: endDate ? endDate.toISOString() : undefined,
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [historyResult, roomResult] = await Promise.allSettled([
        reportsApi.bookingHistory(filterParams),
        meetingRoomsApi.list({ limit: 100 }),
      ])

      if (historyResult.status === 'fulfilled') {
        setRows(historyResult.value)
      } else {
        enqueueSnackbar(getApiErrorMessage(historyResult.reason), { variant: 'error' })
      }

      if (roomResult.status === 'fulfilled') {
        setRooms(roomResult.value)
      } else {
        enqueueSnackbar(getApiErrorMessage(roomResult.reason), { variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, roomId, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(type)
    try {
      const blob =
        type === 'excel'
          ? await reportsApi.exportExcel(filterParams)
          : await reportsApi.exportPdf(filterParams)
      downloadBlob(
        blob,
        `booking-history-${format(new Date(), 'yyyy-MM-dd')}.${type === 'excel' ? 'xlsx' : 'pdf'}`,
      )
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Export failed.'), { variant: 'error' })
    } finally {
      setExporting(null)
    }
  }

  const columns: GridColDef<BookingHistory>[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 180 },
    {
      field: 'meeting_room_id',
      headerName: 'Room',
      width: 160,
      valueGetter: (_v, row) =>
        rooms.find((r) => r.id === row.meeting_room_id)?.name ?? `#${row.meeting_room_id}`,
    },
    {
      field: 'start_time',
      headerName: 'Start',
      width: 170,
      valueGetter: (_v, row) => format(new Date(row.start_time), 'MMM d, yyyy h:mm a'),
    },
    {
      field: 'end_time',
      headerName: 'End',
      width: 130,
      valueGetter: (_v, row) => format(new Date(row.end_time), 'h:mm a'),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <PageHeader
          title="Reports"
          subtitle="Booking history across all rooms with export options."
          actions={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={exporting !== null}
                onClick={() => handleExport('excel')}
                sx={{
                backgroundColor: "#ffff",
                color: "#c33535",
                "&:hover": {
                  backgroundColor: "#ffffff",
                },
              }} 
              >
                {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={exporting !== null}
                onClick={() => handleExport('pdf')}
                sx={{
                backgroundColor: "#ffff",
                color: "#c33535",
                "&:hover": {
                  backgroundColor: "#ffffff",
                },
              }} 
              >
                {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
              </Button>
            </Stack>
          }
        />

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            {Object.values(BookingStatus).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All rooms</MenuItem>
            {rooms.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="From"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Stack>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  )
}
