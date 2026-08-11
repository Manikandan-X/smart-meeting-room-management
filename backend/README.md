# MeetSpace — Smart Meeting Room & Resource Management (Backend)

FastAPI + MySQL backend for the Smart Meeting Room & Resource Management System.

## Tech Stack

- Python 3.12
- FastAPI
- SQLAlchemy ORM
- Alembic (Database Migrations)
- Pydantic / pydantic-settings
- JWT Authentication (python-jose + passlib/bcrypt)
- MySQL 8.0
- Redis + Celery (background jobs / reminders)
- SMTP email (password reset)

## Prerequisites

- Python 3.12+
- MySQL 8.0 running locally or accessible remotely
- Redis running locally or accessible remotely
- pip / virtualenv

## Getting Started

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Create your .env file (see Environment Variables below)
cp .env.example .env            # if you have an example file, otherwise create manually

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file in the project root with the following:

```dotenv
# ==========================================
# Application
# ==========================================
APP_NAME=Smart Meeting Room & Resource Management
APP_VERSION=1.0.0
DEBUG=True
API_V1_PREFIX=/api/v1

# ==========================================
# Server
# ==========================================
HOST=0.0.0.0
PORT=8000

# ==========================================
# Database
# ==========================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_meeting_room
DB_USER=root
DB_PASSWORD=your_db_password
DATABASE_URL=mysql+pymysql://root:your_db_password@localhost:3306/smart_meeting_room

# ==========================================
# JWT
# ==========================================
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# ==========================================
# Redis
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_URL=redis://localhost:6379/0

# ==========================================
# Celery
# ==========================================
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# ==========================================
# CORS
# ==========================================
BACKEND_CORS_ORIGINS=http://localhost:5173

# ==========================================
# Logging
# ==========================================
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
AUDIT_LOG_FILE=logs/audit.log

# ==========================================
# Email / SMTP (used for password reset emails)
# ==========================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Smart Meeting Room

# ==========================================
# Frontend (used to build the password reset link sent by email)
# ==========================================
FRONTEND_URL=http://localhost:5173
```

**Note:** `FRONTEND_URL` must point at wherever your frontend is actually running/deployed — this is what gets embedded in password-reset emails (`{FRONTEND_URL}/reset-password?token=...`). Update it before deploying to production.

## Database Setup

```bash
# Create the database (if it doesn't exist yet)
mysql -u root -p -e "CREATE DATABASE smart_meeting_room;"

# Run all migrations
alembic upgrade head

# To create a new migration after model changes
alembic revision --autogenerate -m "description of change"
```

## Background Jobs (Celery)

Meeting reminders and other scheduled tasks run via Celery + Redis. In a separate terminal:

```bash
celery -A app.celery_app worker --loglevel=info
```

If you use scheduled/periodic tasks, also run Celery Beat:

```bash
celery -A app.celery_app beat --loglevel=info
```

## Project Structure

app/
api/v1/routers/ # FastAPI route definitions, one file per resource
core/ # Config, security (JWT/password hashing), dependencies, exceptions
db/ # SQLAlchemy session/engine setup
models/ # SQLAlchemy ORM models
repositories/ # Data access layer (one per resource)
schemas/ # Pydantic request/response schemas
services/ # Business logic layer (one per resource)
utils/ # Shared utilities (e.g. audit_logger)
main.py # FastAPI app entrypoint
alembic/ # Database migrations

## Key Features

- **JWT Authentication** — login, register, logout, `/auth/me`
- **Password Management** — forgot password (emails a reset link), reset password (token-based, 30-minute expiry), change password (for logged-in users)
- **Role-Based Access Control** — Admin vs Employee, enforced via `get_current_user` / `get_current_admin` dependencies
- **Audit Logging** — CREATE/UPDATE/DELETE/CANCEL/LOGIN/LOGOUT/CHANGE_PASSWORD/FORGOT_PASSWORD/RESET_PASSWORD events logged across all modules
- **Booking System** — meeting room bookings with resource allocation, recurrence (Daily/Weekly/Monthly), conflict detection
- **Reports** — booking history with Excel/PDF export
- **Dashboard Analytics** — room utilization, resource usage, monthly booking stats

## API Endpoints Overview

All endpoints are prefixed with `API_V1_PREFIX` (default `/api/v1`).

| Module | Base Path | Notes |
|---|---|---|
| Authentication | `/auth` | register, login, me, logout, change-password, forgot-password, reset-password |
| Users | `/users` | admin: update, delete |
| Roles | `/roles` | admin: create, update |
| Departments | `/departments` | admin: full CRUD; `/departments/public/list` is unauthenticated (used by the registration form) |
| Meeting Rooms | `/meeting-rooms` | admin: full CRUD; all users: read |
| Resources | `/resources` | admin: full CRUD |
| Room Resources | `/room-resources` | admin: full CRUD (links resources to rooms) |
| Bookings | `/bookings` | all users: own bookings; admin: all bookings |
| Notifications | `/notifications` | per-user notifications |
| Dashboard | `/dashboard` | analytics endpoints (mostly admin) |
| Reports | `/reports` | admin: booking history + Excel/PDF export |
| Audit Logs | `/audit-logs` | admin only |

Full request/response schemas are available at `/docs` once the server is running.

## Known Gotchas / Fixes Applied

- **MySQL naive vs. timezone-aware datetimes**: `DATETIME` columns in MySQL drop timezone info on write/read. Any code comparing a stored timestamp (e.g. `password_reset_token.expires_at`) against `datetime.now(timezone.utc)` must normalize the naive value first, or it raises a 500 (`TypeError: can't compare offset-naive and offset-aware datetimes`). Already fixed in `reset_password`.
- **`limit` query params are capped at 100** server-side (`Query(le=100)`) across list endpoints — make sure any client respects this.
- **`GET /departments/` requires authentication** — the registration form (used by logged-out users) instead calls the separate unauthenticated `GET /departments/public/list`.

## CORS

`BACKEND_CORS_ORIGINS` must include your frontend's origin (e.g. `http://localhost:5173` for local dev). Add production frontend URLs here as a comma-separated list when deploying.

