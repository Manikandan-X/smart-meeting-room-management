import { useEffect, useState, useCallback } from 'react'
import { Box, Chip, IconButton, Stack, MenuItem, TextField } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import PageHeader from '@/components/common/PageHeader'
import SearchField from '@/components/common/SearchField'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UserFormDialog from '@/components/users/UserFormDialog'
import { usersApi } from '@/api/users'
import { rolesApi } from '@/api/roles'
import { departmentsApi } from '@/api/departments'
import type { User, Role, Department } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export default function UsersPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { user: currentUser } = useAuth()

  const [rows, setRows] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [userList, roleList, deptList] = await Promise.all([
        usersApi.list({
          search: search || undefined,
          role_id: roleFilter === 'all' ? undefined : Number(roleFilter),
          department_id: deptFilter === 'all' ? undefined : Number(deptFilter),
          limit: 100,
        }),
        rolesApi.list({ limit: 100 }),
        departmentsApi.list({ limit: 100 }),
      ])
      setRows(userList)
      setRoles(roleList)
      setDepartments(deptList)
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, deptFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await usersApi.remove(deleteTarget.id)
      enqueueSnackbar('User deleted.', { variant: 'success' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const columns: GridColDef<User>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      valueGetter: (_v, row) => `${row.first_name} ${row.last_name}`,
    },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
    {
      field: 'role_name',
      headerName: 'Role',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value === 'Admin' ? 'primary' : 'default'}
        />
      ),
    },
    { field: 'department_name', headerName: 'Department', width: 160 },
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
          <IconButton
            size="small"
            color="error"
            disabled={params.row.id === currentUser?.id}
            onClick={() => setDeleteTarget(params.row)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage employee accounts, roles and department assignments."
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search users..." />
        <TextField
          select
          size="small"
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All roles</MenuItem>
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All departments</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
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

      <UserFormDialog
        open={formOpen}
        user={editing}
        roles={roles}
        departments={departments}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          load()
          enqueueSnackbar('User updated.', { variant: 'success' })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        message={`This will permanently delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
