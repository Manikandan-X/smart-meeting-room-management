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

## Prerequisites

- Node.js 18+ and npm
- The backend running locally (default: `http://localhost:8000`) with all required patches applied — see **Backend Requirements** below

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api/*` requests to `http://localhost:8000` (your FastAPI backend) — see `vite.config.ts`. Update the `target` there if your backend runs elsewhere.

`.env` sets:

VITE_API_BASE_URL=/api/v1

This must match your backend's `API_V1_PREFIX` setting. If your backend uses a different prefix, update this value.

### Production build

```bash
npm run build
npm run preview
```

Output goes to `dist/`. For production, point `VITE_API_BASE_URL` (in `.env.production`) at your real API URL, or keep the proxy pattern if you serve the frontend behind the same reverse proxy as the API.

## Backend Requirements

This frontend depends on a handful of endpoints/fields that go beyond a typical CRUD backend. Make sure your backend includes:

1. **`GET /auth/me`** — returns the logged-in user's id, name, email, role, and department. Required for role-based dashboard routing (there's no other way for a non-admin user to learn their own role after logging in).
2. **`role_id`, `role_name`, `department_name` on `UserResponse`**, and **`role_id` on `UserUpdate`** — needed so the admin Users page can display and change a user's role.
3. **`GET /departments/public/list`** — an *unauthenticated* department list used only by the registration form. A new user has no token yet, so the normal (authenticated) `GET /departments/` endpoint can't be used here. Without this, the Create Account page will 404 on load and redirect back to Login.
4. **Password reset flow**: `POST /auth/forgot-password`, `POST /auth/reset-password`, `PATCH /auth/change-password`, plus a `FRONTEND_URL` setting in your backend `.env` (defaults to `http://localhost:5173`) used to build the reset link sent by email.
5. All list endpoints (`limit` query params) are capped at **100** server-side — the frontend respects this cap everywhere. If you change the backend cap, search the frontend for `limit: 100` and adjust to match.

## Environment Variables

**Frontend** (`.env`):

**Backend** (add to your backend's `.env` if not already present):

FRONTEND_URL=http://localhost:5173

## Role-Based Access

- **Employee**: Dashboard (own upcoming bookings + available rooms), Bookings (own bookings only — enforced server-side), Meeting Rooms (read-only), Notifications, Change Password.
- **Admin**: Everything above (org-wide) plus Resources, Room Resources, Departments, Users, Roles, Reports, and Audit Logs.

Route guards live in `src/guards/`. The sidebar (`src/components/layout/AppLayout.tsx`) hides admin-only links from employees; guards additionally block direct URL access to admin routes.

## Project Structure

src/
api/ # Axios modules, one per backend resource
components/ # Reusable UI, grouped by feature
context/ # AuthContext (login/logout/me)
guards/ # RequireAuth, RequireAdmin
pages/ # Route-level pages, grouped by feature
routes/ # Router configuration
theme/ # MUI theme
types/ # TypeScript interfaces mirroring backend Pydantic schemas

## Features

- **Bookings**: FullCalendar (month/week/list views), create/edit with resource requests (e.g. 2x projector) and recurrence (None/Daily/Weekly/Monthly), cancel flow.
- **Admin Dashboard**: Chart.js visualizations for room utilization, resource usage, and monthly booking stats.
- **Employee Dashboard**: Own upcoming bookings + currently available rooms.
- **Password Management**: Forgot Password → email link → Reset Password (token from URL), plus in-app Change Password from the avatar menu.
- **Notifications**: Live-polling bell (60s interval) + full notifications page.
- **Reports**: Booking history with Excel/PDF export (admin only).
- **Audit Logs**: Full activity trail (admin only).

## Troubleshooting

- **"Not Found" toast right after logging in** → your backend is missing the `GET /auth/me` route, or the server wasn't restarted after adding it.
- **"Input should be less than or equal to 100"** → a `limit` param somewhere exceeds your backend's cap; check the relevant page's API call.
- **Create Account page flashes then redirects to Login** → your backend is missing `GET /departments/public/list`, so the department dropdown 401s and the global interceptor is force-redirecting.
- **500 error on password reset** → likely a MySQL naive/aware datetime comparison bug in `reset_password` — see backend patch notes.

For anything else, check the browser DevTools **Network** tab for the failing request's exact URL and status code — most issues are backend/frontend URL or field mismatches, not logic bugs.