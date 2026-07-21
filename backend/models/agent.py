from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base, UUIDPKMixin, TimestampMixin, utcnow

class Agent(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "agents"

    hostname: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    ip_address: Mapped[str] = mapped_column(String, nullable=False)
    os_type: Mapped[str] = mapped_column(String, nullable=False)  # e.g., windows, linux
    status: Mapped[str] = mapped_column(String, default="offline", nullable=False)  # e.g., online, offline
    last_heartbeat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    telemetries = relationship("Telemetry", back_populates="agent", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="agent", cascade="all, delete-orphan")
