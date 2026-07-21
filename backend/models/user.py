from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class User(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String, default="analyst", nullable=False)
