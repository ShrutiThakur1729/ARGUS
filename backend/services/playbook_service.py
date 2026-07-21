import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.playbook import Playbook
from backend.schemas.playbook_schema import PlaybookCreate, PlaybookUpdate

def get_playbook(db: Session, playbook_id: uuid.UUID) -> Optional[Playbook]:
    return db.query(Playbook).filter(Playbook.id == playbook_id).first()

def list_playbooks(db: Session, skip: int = 0, limit: int = 100) -> List[Playbook]:
    return db.query(Playbook).offset(skip).limit(limit).all()

def get_playbooks_by_incident(db: Session, incident_id: uuid.UUID) -> List[Playbook]:
    return db.query(Playbook).filter(Playbook.incident_id == incident_id).all()

def create_playbook(db: Session, playbook_in: PlaybookCreate) -> Playbook:
    playbook = Playbook(
        incident_id=playbook_in.incident_id,
        title=playbook_in.title,
        description=playbook_in.description,
        steps=playbook_in.steps,
        status=playbook_in.status,
    )
    db.add(playbook)
    db.commit()
    db.refresh(playbook)
    return playbook

def update_playbook(db: Session, playbook_id: uuid.UUID, playbook_up: PlaybookUpdate) -> Optional[Playbook]:
    playbook = get_playbook(db, playbook_id)
    if not playbook:
        return None
    
    update_data = playbook_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(playbook, key, value)
        
    db.commit()
    db.refresh(playbook)
    return playbook
