import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from typing import List


class Settings(BaseSettings):
    # Application Settings
    app_name: str = "SpendWise API"
    app_env: str = "production"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # Database Configuration
    database_url: str
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # SSL Configuration (for Aiven / cloud MySQL)
    database_ssl_required: bool = True
    database_ca_cert: str = ""  # Path to CA cert file, or empty to skip cert verification

    # JWT Security
    jwt_secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # CORS & Frontend
    frontend_origin: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # Feature Toggles
    enable_analytics: bool = True
    enable_backup_import: bool = True
    max_transactions_per_user: int = 10000

    @computed_field
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @computed_field
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.app_env.lower() == "production"

    @computed_field
    @property
    def secure_cookies(self) -> bool:
        """Use secure cookies in production (requires HTTPS)."""
        return self.is_production

    @computed_field
    @property
    def cookie_samesite(self) -> str:
        """Cookie SameSite policy - 'lax' for development, 'none' for cross-site production."""
        return "none" if self.is_production else "lax"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra environment variables
    )


settings = Settings()