import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AgentBase(BaseModel):
    hostname: str
    ip_address: str
    os_type: str

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: uuid.UUID
    status: str
    last_heartbeat: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AgentHeartbeat(BaseModel):
    status: str = "online"
