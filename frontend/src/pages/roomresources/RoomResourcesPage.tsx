import { useEffect, useState, useCallback } from 'react'
import { Box, Button, IconButton, Stack, MenuItem, TextField } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import RoomResourceFormDialog from '@/components/roomresources/RoomResourceFormDialog'
import { roomResourcesApi } from '@/api/roomResources'
import { meetingRoomsApi } from '@/api/meetingRooms'
import { resourcesApi } from '@/api/resources'
import type { RoomResource, MeetingRoom, Resource } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function RoomResourcesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<RoomResource[]>([])
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [roomFilter, setRoomFilter] = useState<string>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoomResource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoomResource | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rrResult, roomResult, resourceResult] = await Promise.allSettled([
        roomResourcesApi.list({
          meeting_room_id: roomFilter === 'all' ? undefined : Number(roomFilter),
          limit: 100,
        }),
        meetingRoomsApi.list({ limit: 100 }),
        resourcesApi.list({ limit: 100 }),
      ])

      if (rrResult.status === 'fulfilled') {
        setRows(rrResult.value)
      } else {
        enqueueSnackbar(getApiErrorMessage(rrResult.reason), { variant: 'error' })
      }

      if (roomResult.status === 'fulfilled') {
        setRooms(roomResult.value)
      } else {
        enqueueSnackbar(getApiErrorMessage(roomResult.reason), { variant: 'error' })
      }

      if (resourceResult.status === 'fulfilled') {
        setResources(resourceResult.value)
      } else {
        enqueueSnackbar(getApiErrorMessage(resourceResult.reason), { variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomFilter])

  useEffect(() => {
    load()
  }, [load])

  const roomName = (id: number) => rooms.find((r) => r.id === id)?.name ?? `Room #${id}`
  const resourceName = (id: number) =>
    resources.find((r) => r.id === id)?.name ?? `Resource #${id}`

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await roomResourcesApi.remove(deleteTarget.id)
      enqueueSnackbar('Assignment removed.', { variant: 'success' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const columns: GridColDef<RoomResource>[] = [
    {
      field: 'meeting_room_id',
      headerName: 'Meeting Room',
      flex: 1,
      minWidth: 160,
      valueGetter: (_v, row) => roomName(row.meeting_room_id),
    },
    {
      field: 'resource_id',
      headerName: 'Resource',
      flex: 1,
      minWidth: 160,
      valueGetter: (_v, row) => resourceName(row.resource_id),
    },
    { field: 'quantity', headerName: 'Quantity', width: 110 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
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
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <Box>
      <PageHeader
        title="Room Resources"
        subtitle="Assign resources (like projectors) to specific meeting rooms."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            sx={{
                backgroundColor: "#c33535",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#a82d2d",
                },
              }}  
          >
            New Assignment
          </Button>
        }
      />

      <Stack direction="row" sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Filter by room"
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All rooms</MenuItem>
          {rooms.map((r) => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      <RoomResourceFormDialog
        open={formOpen}
        roomResource={editing}
        rooms={rooms}
        resources={resources}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          load()
          enqueueSnackbar(editing ? 'Assignment updated.' : 'Assignment created.', {
            variant: 'success',
          })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove assignment?"
        message="This will unassign the resource from this meeting room."
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
