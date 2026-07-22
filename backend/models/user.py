import uuid
from typing import Optional
from sqlalchemy import String, Boolean, UUID
from sqlalchemy.orm import Mapped, mapped_column
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class User(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String, default="analyst", nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
