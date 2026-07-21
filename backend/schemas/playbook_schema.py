import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class PlaybookBase(BaseModel):
    title: str
    description: Optional[str] = None
    steps: List[dict]
    status: str = "recommended"  # recommended, executed, failed

class PlaybookCreate(PlaybookBase):
    incident_id: uuid.UUID

class PlaybookUpdate(BaseModel):
    status: Optional[str] = None
    steps: Optional[List[dict]] = None

class PlaybookResponse(PlaybookBase):
    id: uuid.UUID
    incident_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
