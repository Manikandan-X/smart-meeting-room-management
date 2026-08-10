import { useEffect, useState, useCallback } from 'react'
import { Box, Button, Chip, IconButton, Stack, MenuItem, TextField } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import SearchField from '@/components/common/SearchField'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ResourceFormDialog from '@/components/resources/ResourceFormDialog'
import { resourcesApi } from '@/api/resources'
import type { Resource } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function ResourcesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<'all' | 'true' | 'false'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await resourcesApi.list({
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
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await resourcesApi.remove(deleteTarget.id)
      enqueueSnackbar('Resource deleted.', { variant: 'success' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const columns: GridColDef<Resource>[] = [
    { field: 'name', headerName: 'Resource Name', flex: 1, minWidth: 180 },
    { field: 'quantity', headerName: 'Total Quantity', width: 150 },
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
        title="Resources"
        subtitle="Manage shared equipment and resources that can be assigned to rooms."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New Resource
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search resources..." />
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
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      <ResourceFormDialog
        open={formOpen}
        resource={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          load()
          enqueueSnackbar(editing ? 'Resource updated.' : 'Resource created.', {
            variant: 'success',
          })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete resource?"
        message={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
