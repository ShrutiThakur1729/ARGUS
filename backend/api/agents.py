import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.agent_schema import AgentCreate, AgentResponse, AgentHeartbeat
from backend.services import agent_service
from backend.models.user import User

router = APIRouter()

@router.post("/enroll", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def enroll_agent(agent_in: AgentCreate, db: Session = Depends(get_db)):
    return agent_service.create_or_update_agent(db, agent_in)

@router.get("/", response_model=List[AgentResponse])
def list_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return agent_service.list_agents(db, skip=skip, limit=limit)

@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    agent = agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/{agent_id}/heartbeat", response_model=AgentResponse)
def agent_heartbeat(agent_id: uuid.UUID, heartbeat: AgentHeartbeat, db: Session = Depends(get_db)):
    agent = agent_service.update_heartbeat(db, agent_id, status=heartbeat.status)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = agent_service.delete_agent(db, agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return


class AgentConfigPatch(BaseModel):
    status: Optional[str] = None          # "online" | "offline" | "disabled"
    heartbeat_interval: Optional[int] = None   # seconds
    log_level: Optional[str] = None       # "INFO" | "DEBUG" | "WARNING" | "ERROR"

@router.patch("/{agent_id}/config", response_model=AgentResponse)
def configure_agent(
    agent_id: uuid.UUID,
    config: AgentConfigPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an agent's configuration: status (enable/disable),
    heartbeat interval, and log verbosity level.
    """
    agent = agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if config.status is not None:
        agent.status = config.status
    
    # Store extra config in the agent record if columns exist
    # These are graceful no-ops if the columns aren't yet on the model
    if config.heartbeat_interval is not None:
        try:
            agent.heartbeat_interval = config.heartbeat_interval
        except AttributeError:
            pass  # Column not yet on model — graceful skip
    
    if config.log_level is not None:
        try:
            agent.log_level = config.log_level
        except AttributeError:
            pass  # Column not yet on model — graceful skip
    
    db.commit()
    db.refresh(agent)
    return agent
