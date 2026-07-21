import uuid
from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class Prediction(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "predictions"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    predicted_next_step: Mapped[str] = mapped_column(String, nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    mitre_tactic: Mapped[str] = mapped_column(String, nullable=True)
    mitre_technique: Mapped[str] = mapped_column(String, nullable=True)

    incident = relationship("Incident", back_populates="predictions")
