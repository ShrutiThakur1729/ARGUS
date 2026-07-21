import os
from typing import List
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ARGUS")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Parse comma separated list of CORS origins
    cors_raw: str = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in cors_raw.split(",") if origin.strip()
    ] if cors_raw else ["http://localhost:5173", "http://localhost:3000"]

settings = Settings()

if not settings.SECRET_KEY or settings.SECRET_KEY == "YOUR_RANDOM_SECRET":
    raise ValueError(
        "SECRET_KEY environment variable is not configured or is using an insecure default. "
        "Please configure a cryptographically secure SECRET_KEY in your .env file."
    )

