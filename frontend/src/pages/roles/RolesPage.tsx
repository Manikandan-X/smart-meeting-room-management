import { useEffect, useState, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import RoleFormDialog from '@/components/roles/RoleFormDialog'
import { rolesApi } from '@/api/roles'
import type { Role } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

export default function RolesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await rolesApi.list({ limit: 100 })
      setRows(data)
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns: GridColDef<Role>[] = [
    { field: 'name', headerName: 'Role', flex: 1, minWidth: 160 },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 220 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Edit role">
          <IconButton
            size="small"
            onClick={() => {
              setEditing(params.row)
              setFormOpen(true)
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Box>
      <PageHeader
        title="Roles"
        subtitle="Manage access roles assigned to users (e.g. Admin, Employee)."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New Role
          </Button>
        }
      />

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

      <RoleFormDialog
        open={formOpen}
        role={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          load()
          enqueueSnackbar(editing ? 'Role updated.' : 'Role created.', { variant: 'success' })
        }}
      />
    </Box>
  )
}
