"""
Application Configuration
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List, Optional

# Resolve .env path relative to this file, not CWD
ENV_FILE = str(Path(__file__).resolve().parent.parent.parent / ".env")

class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    DEEPGRAM_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Supabase (optional for early development)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # Database (optional for early development)
    DATABASE_URL: Optional[str] = None

    # JWT (optional for early development)
    JWT_SECRET: str = "dev-secret-change-in-production"

    # Server
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:3003"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ENV_FILE
        case_sensitive = True

settings = Settings()
