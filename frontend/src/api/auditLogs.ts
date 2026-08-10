import { apiClient } from './client'
import type { AuditLog } from '@/types/models'

export interface AuditLogListParams {
  skip?: number
  limit?: number
}

export const auditLogsApi = {
  list: async (
    params: AuditLogListParams = {},
  ): Promise<AuditLog[]> => {
    const { data } = await apiClient.get<AuditLog[]>(
      '/audit-logs',
      { params },
    )
    return data
  },
}
