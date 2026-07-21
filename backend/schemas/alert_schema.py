import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlertBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str  # low, medium, high, critical
    status: str = "open"  # open, acknowledged, resolved
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    mitre_technique_id: Optional[str] = None

class AlertCreate(AlertBase):
    agent_id: Optional[uuid.UUID] = None
    telemetry_id: Optional[uuid.UUID] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    incident_id: Optional[uuid.UUID] = None

class AlertResponse(AlertBase):
    id: uuid.UUID
    agent_id: Optional[uuid.UUID] = None
    telemetry_id: Optional[uuid.UUID] = None
    incident_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
