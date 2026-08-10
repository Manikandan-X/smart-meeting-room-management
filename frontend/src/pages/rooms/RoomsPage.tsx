import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  MenuItem,
  TextField,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import SearchField from '@/components/common/SearchField'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import RoomFormDialog from '@/components/rooms/RoomFormDialog'
import { meetingRoomsApi } from '@/api/meetingRooms'
import type { MeetingRoom } from '@/types/models'
import { useAuth } from '@/context/AuthContext'
import { getApiErrorMessage } from '@/api/client'

export default function RoomsPage() {
  const { isAdmin } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [rows, setRows] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<'all' | 'true' | 'false'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MeetingRoom | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MeetingRoom | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadRooms = useCallback(async () => {
    setLoading(true)
    try {
      const data = await meetingRoomsApi.list({
        search: search || undefined,
        is_available: availability === 'all' ? undefined : availability === 'true',
        limit: 100,
      })
      setRows(data)
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, availability])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await meetingRoomsApi.remove(deleteTarget.id)
      enqueueSnackbar('Meeting room deleted.', { variant: 'success' })
      setDeleteTarget(null)
      loadRooms()
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const columns: GridColDef<MeetingRoom>[] = [
    { field: 'name', headerName: 'Room Name', flex: 1, minWidth: 160 },
    { field: 'capacity', headerName: 'Capacity', width: 110 },
    { field: 'facilities', headerName: 'Facilities', flex: 1.3, minWidth: 200 },
    {
      field: 'is_available',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? 'Available' : 'Unavailable'}
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    ...(isAdmin
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params: { row: MeetingRoom }) => (
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(params.row)
                    setFormOpen(true)
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteTarget(params.row)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          } satisfies GridColDef<MeetingRoom>,
        ]
      : []),
  ]

  return (
    <Box>
      <PageHeader
        title="Meeting Rooms"
        subtitle={
          isAdmin
            ? 'Manage all meeting rooms available for booking.'
            : 'Browse meeting rooms available for booking.'
        }
        actions={
          isAdmin ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              New Room
            </Button>
          ) : undefined
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search rooms..." />
        <TextField
          select
          size="small"
          label="Availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as typeof availability)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">Available</MenuItem>
          <MenuItem value="false">Unavailable</MenuItem>
        </TextField>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      {isAdmin && (
        <>
          <RoomFormDialog
            open={formOpen}
            room={editing}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false)
              loadRooms()
              enqueueSnackbar(editing ? 'Room updated.' : 'Room created.', {
                variant: 'success',
              })
            }}
          />
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="Delete meeting room?"
            message={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
            confirmLabel="Delete"
            loading={deleting}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        </>
      )}
    </Box>
  )
}
