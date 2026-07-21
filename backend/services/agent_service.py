import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.agent import Agent
from backend.schemas.agent_schema import AgentCreate
from backend.models.base import utcnow

def get_agent(db: Session, agent_id: uuid.UUID) -> Optional[Agent]:
    return db.query(Agent).filter(Agent.id == agent_id).first()

def get_agent_by_hostname(db: Session, hostname: str) -> Optional[Agent]:
    return db.query(Agent).filter(Agent.hostname == hostname).first()

def list_agents(db: Session, skip: int = 0, limit: int = 100) -> List[Agent]:
    return db.query(Agent).offset(skip).limit(limit).all()

def create_or_update_agent(db: Session, agent_in: AgentCreate) -> Agent:
    agent = get_agent_by_hostname(db, agent_in.hostname)
    if agent:
        agent.ip_address = agent_in.ip_address
        agent.os_type = agent_in.os_type
        agent.status = "online"
        agent.last_heartbeat = utcnow()
    else:
        agent = Agent(
            hostname=agent_in.hostname,
            ip_address=agent_in.ip_address,
            os_type=agent_in.os_type,
            status="online",
            last_heartbeat=utcnow(),
        )
        db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

def update_heartbeat(db: Session, agent_id: uuid.UUID, status: str = "online") -> Optional[Agent]:
    agent = get_agent(db, agent_id)
    if agent:
        agent.status = status
        agent.last_heartbeat = utcnow()
        db.commit()
        db.refresh(agent)
    return agent

def delete_agent(db: Session, agent_id: uuid.UUID) -> bool:
    agent = get_agent(db, agent_id)
    if not agent:
        return False
    db.delete(agent)
    db.commit()
    return True

