import { Chip } from '@mui/material'
import type { BookingStatus } from '@/types/enums'

const colorMap: Record<BookingStatus, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
  Pending: 'warning',
  Confirmed: 'success',
  Cancelled: 'error',
  Completed: 'info',
}

export default function StatusChip({ status }: { status: BookingStatus }) {
  return <Chip label={status} color={colorMap[status] ?? 'default'} size="small" />
}
