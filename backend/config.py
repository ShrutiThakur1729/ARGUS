import os
import logging
from typing import List
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

# Setup logger for startup configuration validation
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("argus.config")

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ARGUS")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # JWT Config (with backward compatibility)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", ""))
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", os.getenv("ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Map SECRET_KEY & ALGORITHM for backward compatibility with jose decode calls
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", ""))
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", os.getenv("ALGORITHM", "HS256"))

    # Telegram integration
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

    # Supabase Integration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # AI Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # Email config
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "onboarding@resend.dev")

    # Feature switches based on presence of API keys
    AI_ENABLED: bool = False
    EMAIL_ENABLED: bool = False
    TELEGRAM_ENABLED: bool = False

    # Parse comma separated list of CORS origins
    cors_raw: str = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in cors_raw.split(",") if origin.strip()
    ] if cors_raw else ["http://localhost:5173", "http://localhost:3000"]

settings = Settings()

# =================================================
# ENVIRONMENT CONFIGURATION VALIDATION
# =================================================

# 1. DATABASE_URL validation: Fail startup if missing
if not settings.DATABASE_URL:
    logger.critical("DATABASE_URL environment variable is missing. Failing startup.")
    raise ValueError("DATABASE_URL environment variable is missing. Startup failed.")

# 2. JWT_SECRET_KEY validation: Fail startup if missing or using insecure default
if not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "YOUR_RANDOM_SECRET":
    logger.critical("JWT_SECRET_KEY environment variable is missing or insecure. Failing startup.")
    raise ValueError(
        "JWT_SECRET_KEY environment variable is not configured or is using an insecure default. "
        "Please configure a cryptographically secure JWT_SECRET_KEY in your .env file."
    )

# 3. GEMINI_API_KEY validation: Disable AI features gracefully if missing, use fallback if available
if settings.GEMINI_API_KEY:
    settings.AI_ENABLED = True
    logger.info("AI Service initialized with Gemini as primary provider.")
elif settings.OPENROUTER_API_KEY:
    settings.AI_ENABLED = True
    logger.warning("GEMINI_API_KEY is missing. AI Service initialized with OpenRouter fallback as primary.")
else:
    settings.AI_ENABLED = False
    logger.warning("Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured. AI features are disabled gracefully.")

# 4. RESEND_API_KEY validation: Disable email delivery if missing
if settings.RESEND_API_KEY:
    settings.EMAIL_ENABLED = True
    logger.info("Email delivery service successfully initialized via Resend.")
else:
    settings.EMAIL_ENABLED = False
    logger.warning("RESEND_API_KEY is missing. Email report delivery features are disabled gracefully.")

# 5. Telegram validation: Disable alerts if missing
if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID:
    settings.TELEGRAM_ENABLED = True
    logger.info("Telegram notification channel successfully configured.")
else:
    settings.TELEGRAM_ENABLED = False
    logger.warning("Telegram bot credentials or chat ID are missing. Telegram alerts are disabled gracefully.")
