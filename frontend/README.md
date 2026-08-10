# MeetSpace — Smart Meeting Room & Resource Management (Frontend)

React + TypeScript frontend for the Smart Meeting Room & Resource Management System, built to match your FastAPI/MySQL backend.

## Tech Stack

- React 19 (Vite)
- TypeScript
- Material UI (MUI) v6
- React Router v7
- Axios
- FullCalendar (booking calendar)
- Chart.js (admin dashboard)
- MUI X DataGrid & Date Pickers
- notistack (toast notifications)

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api/*` requests to `http://localhost:8000` (your FastAPI backend) — see `vite.config.ts`. Update the proxy target if your backend runs elsewhere.

`.env` sets `VITE_API_BASE_URL=/api/v1`, matching your backend's `api_v1_prefix`. Adjust if your backend uses a different prefix.

### Production build

```bash
npm run build
npm run preview
```

Output goes to `dist/`. Point `VITE_API_BASE_URL` (in `.env.production`) at your real API URL, or keep the proxy pattern if you serve the frontend behind the same reverse proxy as the API.

## Backend changes required

This frontend expects three small additions to your backend (all included as patched files in the accompanying `backend` folder — diff them against your original to see exactly what changed):

1. **`GET /auth/me`** — returns the logged-in user's id, name, email, role, and department. Your original backend had no way for a non-admin user to learn their own role after logging in, which is required for role-based dashboard routing.
2. **`role_id`, `role_name`, `department_name` added to `UserResponse`**, and **`role_id` added to `UserUpdate`** — needed so the admin Users page can display and change a user's role.
3. **Minor model/service adjustments** to support the above (`User.role_name` / `User.department_name` properties, `RoleCreate`/`RoleUpdate` schemas, `Role` CRUD in the repository/service/router) — carried over from our audit-logging work earlier in this project.

## Role-based access

- **Employee**: Dashboard (own upcoming bookings + available rooms), Bookings (own bookings only — enforced server-side), Meeting Rooms (read-only), Notifications.
- **Admin**: Everything above (org-wide) plus Resources, Room Resources, Departments, Users, Roles, Reports, and Audit Logs.

Route guards live in `src/guards/`. The sidebar (`src/components/layout/AppLayout.tsx`) hides admin-only links from employees; guards additionally block direct URL access.

## Project Structure

```
src/
  api/          # Axios modules, one per backend resource
  components/   # Reusable UI, grouped by feature
  context/      # AuthContext (login/logout/me)
  guards/       # RequireAuth, RequireAdmin
  pages/        # Route-level pages, grouped by feature
  routes/       # Router configuration
  theme/        # MUI theme
  types/        # TypeScript interfaces mirroring backend Pydantic schemas
```

## Notes

- Bookings support recurrence (None/Daily/Weekly/Monthly) and per-booking resource requests (e.g. 2x projector), matching your `BookingCreate`/`BookingUpdate` schemas.
- Reports page exports booking history to Excel or PDF via your `/reports/booking-history/export/*` endpoints.
- The notification bell polls `/notifications/unread` every 60s. Adjust the interval in `src/components/layout/NotificationBell.tsx` if needed.
