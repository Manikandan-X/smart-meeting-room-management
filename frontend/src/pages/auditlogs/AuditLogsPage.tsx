import { useEffect, useState, useCallback } from 'react'
import { Box, Chip } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useSnackbar } from 'notistack'
import { format } from 'date-fns'
import PageHeader from '@/components/common/PageHeader'
import { auditLogsApi } from '@/api/auditLogs'
import type { AuditLog } from '@/types/models'
import { getApiErrorMessage } from '@/api/client'

const actionColor: Record<string, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  CANCEL: 'error',
  LOGIN: 'default',
  LOGOUT: 'default',
}

export default function AuditLogsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [rows, setRows] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await auditLogsApi.list({ limit: 200 })
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

  const columns: GridColDef<AuditLog>[] = [
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 180,
      valueGetter: (_v, row) => format(new Date(row.created_at), 'MMM d, yyyy h:mm a'),
    },
    { field: 'user_id', headerName: 'User ID', width: 100 },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={actionColor[params.value] ?? 'default'} />
      ),
    },
    { field: 'entity_type', headerName: 'Entity', width: 140 },
    { field: 'entity_id', headerName: 'Entity ID', width: 100 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 260 },
  ]

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="Track create, update, delete and authentication activity across the system."
      />
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
  )
}
