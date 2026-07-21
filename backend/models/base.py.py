"""
ARGUS Core - Model Base Mixin

Shared columns for every ORM model in the system: a UUID primary key and
created/updated timestamps. Concrete models inherit from `Base` (the
SQLAlchemy declarative base) AND `TimestampMixin` / `UUIDPKMixin` below.

No AI logic, no route logic, no session logic here.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UUIDPKMixin:
    """Adds a UUID primary key column named `id`."""

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )


class TimestampMixin:
    """Adds `created_at` / `updated_at` columns, managed by the application."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )