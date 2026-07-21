import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TelemetryBase(BaseModel):
    telemetry_type: str  # e.g., process, network, auth, system
    data: dict

class TelemetryCreate(TelemetryBase):
    agent_id: uuid.UUID

class TelemetryResponse(TelemetryBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    timestamp: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
