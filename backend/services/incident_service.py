import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.incident import Incident
from backend.schemas.incident_schema import IncidentCreate, IncidentUpdate

def get_incident(db: Session, incident_id: uuid.UUID) -> Optional[Incident]:
    return db.query(Incident).filter(Incident.id == incident_id).first()

def list_incidents(db: Session, skip: int = 0, limit: int = 100) -> List[Incident]:
    return db.query(Incident).order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()

def create_incident(db: Session, incident_in: IncidentCreate) -> Incident:
    incident = Incident(
        title=incident_in.title,
        description=incident_in.description,
        status=incident_in.status,
        severity=incident_in.severity,
        assigned_to=incident_in.assigned_to,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

def update_incident(db: Session, incident_id: uuid.UUID, incident_up: IncidentUpdate) -> Optional[Incident]:
    incident = get_incident(db, incident_id)
    if not incident:
        return None
    
    update_data = incident_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)
        
    db.commit()
    db.refresh(incident)
    return incident
