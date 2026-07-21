import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
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

