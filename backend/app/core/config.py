from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================================
    # Application
    # ==========================================
    app_name: str = Field(alias="APP_NAME")
    app_version: str = Field(alias="APP_VERSION")
    debug: bool = Field(alias="DEBUG")
    api_v1_prefix: str = Field(alias="API_V1_PREFIX")

    # ==========================================
    # Server
    # ==========================================
    host: str = Field(alias="HOST")
    port: int = Field(alias="PORT")

    # ==========================================
    # Database
    # ==========================================
    db_host: str = Field(alias="DB_HOST")
    db_port: int = Field(alias="DB_PORT")
    db_name: str = Field(alias="DB_NAME")
    db_user: str = Field(alias="DB_USER")
    db_password: str = Field(alias="DB_PASSWORD")
    database_url: str = Field(alias="DATABASE_URL")

    # ==========================================
    # JWT
    # ==========================================
    secret_key: str = Field(alias="SECRET_KEY")
    algorithm: str = Field(alias="ALGORITHM")
    access_token_expire_minutes: int = Field(alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # ==========================================
    # Redis
    # ==========================================
    redis_host: str = Field(alias="REDIS_HOST")
    redis_port: int = Field(alias="REDIS_PORT")
    redis_db: int = Field(alias="REDIS_DB")
    redis_url: str = Field(alias="REDIS_URL")

    # ==========================================
    # Celery
    # ==========================================
    celery_broker_url: str = Field(alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(alias="CELERY_RESULT_BACKEND")

    # ==========================================
    # CORS
    # ==========================================
    backend_cors_origins: str = Field(alias="BACKEND_CORS_ORIGINS")

    # ==========================================
    # Logging
    # ==========================================
    log_level: str = Field(alias="LOG_LEVEL")
    log_file: str = Field(alias="LOG_FILE")
    audit_log_file: str = Field(alias="AUDIT_LOG_FILE")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # ==========================================
    # Email / SMTP
    # ==========================================
    mail_host: str = Field(alias="MAIL_HOST")
    mail_port: int = Field(alias="MAIL_PORT")
    mail_username: str = Field(alias="MAIL_USERNAME")
    mail_password: str = Field(alias="MAIL_PASSWORD")
    mail_from: str = Field(alias="MAIL_FROM")
    mail_from_name: str = Field(alias="MAIL_FROM_NAME")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()