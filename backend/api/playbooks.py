import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.playbook_schema import PlaybookCreate, PlaybookUpdate, PlaybookResponse
from backend.services import playbook_service
from backend.models.user import User

router = APIRouter()

@router.post("/", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
def create_playbook(
    playbook_in: PlaybookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return playbook_service.create_playbook(db, playbook_in)

@router.get("/", response_model=List[PlaybookResponse])
def list_playbooks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return playbook_service.list_playbooks(db, skip=skip, limit=limit)

@router.get("/incident/{incident_id}", response_model=List[PlaybookResponse])
def get_incident_playbooks(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return playbook_service.get_playbooks_by_incident(db, incident_id)

@router.get("/{playbook_id}", response_model=PlaybookResponse)
def get_playbook(
    playbook_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playbook = playbook_service.get_playbook(db, playbook_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbook

@router.put("/{playbook_id}", response_model=PlaybookResponse)
def update_playbook(
    playbook_id: uuid.UUID,
    playbook_up: PlaybookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playbook = playbook_service.update_playbook(db, playbook_id, playbook_up)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbook
