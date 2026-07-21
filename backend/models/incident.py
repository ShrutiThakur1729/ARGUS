from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class Incident(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "incidents"

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="open", nullable=False)  # open, investigating, resolved, closed
    severity: Mapped[str] = mapped_column(String, default="medium", nullable=False)  # low, medium, high, critical
    assigned_to: Mapped[str] = mapped_column(String, nullable=True)  # Username of assigned analyst

    alerts = relationship("Alert", back_populates="incident")
    playbooks = relationship("Playbook", back_populates="incident", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="incident", cascade="all, delete-orphan")
