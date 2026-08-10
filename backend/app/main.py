from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.scheduler.notification_scheduler import (
    start_notification_scheduler,
    stop_notification_scheduler,
)
from contextlib import asynccontextmanager

from app.api.v1.routers.role import router as role_router
from app.api.v1.routers.department import router as department_router
from app.api.v1.routers.user import router as user_router
from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.meeting_room import router as meeting_room_router
from app.api.v1.routers.resource import router as resource_router
from app.api.v1.routers.room_resource import router as room_resource_router
from app.api.v1.routers.booking import router as booking_router
from app.api.v1.routers.notification import router as notification_router
from app.api.v1.routers.dashboard import router as dashboard_router
from app.api.v1.routers.report import router as report_router
from app.api.v1.routers.audit_log import router as audit_router



@asynccontextmanager
async def lifespan(app: FastAPI):

    start_notification_scheduler()

    yield

    stop_notification_scheduler()



app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.backend_cors_origins.split(",")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes

app.include_router(
    auth_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    role_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    department_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    user_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    meeting_room_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    resource_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    room_resource_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    booking_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    notification_router,
    prefix=settings.api_v1_prefix
)
app.include_router(
    dashboard_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    report_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    audit_router,
    prefix=settings.api_v1_prefix,
)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "status": "Running",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "application": settings.app_name,
    }