from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from backend.models.base import Base, UUIDPKMixin, TimestampMixin

class Organization(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String, nullable=False)
    institution: Mapped[str] = mapped_column(String, nullable=False)
    department: Mapped[str] = mapped_column(String, nullable=True)
    country: Mapped[str] = mapped_column(String, nullable=False)
    timezone: Mapped[str] = mapped_column(String, nullable=False)
    logo: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    website: Mapped[str] = mapped_column(String, nullable=True)
