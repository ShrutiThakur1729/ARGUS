import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class Playbook(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "playbooks"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    steps: Mapped[list] = mapped_column(JSON, nullable=False)  # JSON list of dict steps
    status: Mapped[str] = mapped_column(String, default="recommended", nullable=False)  # recommended, executed, failed

    incident = relationship("Incident", back_populates="playbooks")
