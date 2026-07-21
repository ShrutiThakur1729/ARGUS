import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class Alert(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "alerts"

    agent_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
    )
    telemetry_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("telemetry.id", ondelete="SET NULL"),
        nullable=True,
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    severity: Mapped[str] = mapped_column(String, nullable=False)  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String, default="open", nullable=False)  # open, acknowledged, resolved

    mitre_tactic: Mapped[str] = mapped_column(String, nullable=True)
    mitre_technique: Mapped[str] = mapped_column(String, nullable=True)
    mitre_technique_id: Mapped[str] = mapped_column(String, nullable=True)

    agent = relationship("Agent", back_populates="alerts")
    telemetry = relationship("Telemetry")
    incident = relationship("Incident", back_populates="alerts")
