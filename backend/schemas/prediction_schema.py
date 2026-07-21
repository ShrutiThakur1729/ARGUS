import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PredictionBase(BaseModel):
    predicted_next_step: str
    probability: float
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

class PredictionCreate(PredictionBase):
    incident_id: uuid.UUID

class PredictionResponse(PredictionBase):
    id: uuid.UUID
    incident_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
