import uuid
from typing import List
from sqlalchemy.orm import Session
from backend.models.telemetry import Telemetry
from backend.schemas.telemetry_schema import TelemetryCreate
from backend.services.agent_service import update_heartbeat

def create_telemetry(db: Session, telemetry_in: TelemetryCreate) -> Telemetry:
    telemetry = Telemetry(
        agent_id=telemetry_in.agent_id,
        telemetry_type=telemetry_in.telemetry_type,
        data=telemetry_in.data,
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    
    # Update agent heartbeat when telemetry is received
    update_heartbeat(db, telemetry_in.agent_id, status="online")
    
    return telemetry

def list_telemetry(db: Session, skip: int = 0, limit: int = 100) -> List[Telemetry]:
    return db.query(Telemetry).order_by(Telemetry.timestamp.desc()).offset(skip).limit(limit).all()

def get_telemetry_by_agent(db: Session, agent_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Telemetry]:
    return (
        db.query(Telemetry)
        .filter(Telemetry.agent_id == agent_id)
        .order_by(Telemetry.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
