import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config import settings

logger = logging.getLogger("argus.database")

db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql+psycopg://"):
    db_url = db_url.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)

# Try connecting to the configured PostgreSQL database
try:
    if not db_url:
        raise ValueError("DATABASE_URL is not set.")
    
    # Use connection timeout of 5s to avoid hanging during startup check
    connect_args = {"connect_timeout": 5} if "sqlite" not in db_url else {}
    engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
    
    # Verify connectivity
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Successfully connected to primary PostgreSQL database.")
except Exception as e:
    logger.warning(
        f"Failed to connect to primary database ({e}). "
        "Falling back to local SQLite database (sqlite:///./argus.db) for demo/offline resilience."
    )
    db_url = "sqlite:///./argus.db"
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass
