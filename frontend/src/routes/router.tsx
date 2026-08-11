import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from '@/guards/RequireAuth'
import RequireAdmin from '@/guards/RequireAdmin'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import BookingsPage from '@/pages/bookings/BookingsPage'
import RoomsPage from '@/pages/rooms/RoomsPage'
import ResourcesPage from '@/pages/resources/ResourcesPage'
import RoomResourcesPage from '@/pages/roomresources/RoomResourcesPage'
import DepartmentsPage from '@/pages/departments/DepartmentsPage'
import UsersPage from '@/pages/users/UsersPage'
import RolesPage from '@/pages/roles/RolesPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import AuditLogsPage from '@/pages/auditlogs/AuditLogsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/bookings', element: <BookingsPage /> },
          { path: '/rooms', element: <RoomsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          {
            element: <RequireAdmin />,
            children: [
              { path: '/resources', element: <ResourcesPage /> },
              { path: '/room-resources', element: <RoomResourcesPage /> },
              { path: '/departments', element: <DepartmentsPage /> },
              { path: '/users', element: <UsersPage /> },
              { path: '/roles', element: <RolesPage /> },
              { path: '/reports', element: <ReportsPage /> },
              { path: '/audit-logs', element: <AuditLogsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
