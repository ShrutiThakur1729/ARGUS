import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "open"  # e.g., open, investigating, resolved, closed
    severity: str = "medium"  # e.g., low, medium, high, critical
    assigned_to: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
