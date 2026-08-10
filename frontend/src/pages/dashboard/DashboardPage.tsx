import { useAuth } from '@/context/AuthContext'
import AdminDashboardPage from './AdminDashboardPage'
import EmployeeDashboardPage from './EmployeeDashboardPage'

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboardPage /> : <EmployeeDashboardPage />
}
