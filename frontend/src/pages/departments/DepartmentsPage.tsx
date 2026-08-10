import { useEffect, useState, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import SearchField from '@/components/common/SearchField'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DepartmentFormDialog from '@/components/departments/DepartmentFormDialog'
import { departmentsApi } from '@/api/departments'
import type { Department } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function DepartmentsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await departmentsApi.list({ search: search || undefined, limit: 100 })
      setRows(data)
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await departmentsApi.remove(deleteTarget.id)
      enqueueSnackbar('Department deleted.', { variant: 'success' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const columns: GridColDef<Department>[] = [
    { field: 'name', headerName: 'Department', flex: 1, minWidth: 180 },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 220 },
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
        title="Departments"
        subtitle="Manage organizational departments used for user assignment."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New Department
          </Button>
        }
      />

      <Stack direction="row" sx={{ mb: 2 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search departments..." />
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

      <DepartmentFormDialog
        open={formOpen}
        department={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          load()
          enqueueSnackbar(editing ? 'Department updated.' : 'Department created.', {
            variant: 'success',
          })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete department?"
        message={`This will permanently delete "${deleteTarget?.name}". Users assigned to it will be affected.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
