import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.telemetry_schema import TelemetryCreate, TelemetryResponse
from backend.services import telemetry_service
from backend.models.user import User

router = APIRouter()

@router.post("/", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def submit_telemetry(telemetry_in: TelemetryCreate, db: Session = Depends(get_db)):
    return telemetry_service.create_telemetry(db, telemetry_in)

@router.get("/", response_model=List[TelemetryResponse])
def get_all_telemetry(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return telemetry_service.list_telemetry(db, skip=skip, limit=limit)

@router.get("/agent/{agent_id}", response_model=List[TelemetryResponse])
def get_agent_telemetry(
    agent_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return telemetry_service.get_telemetry_by_agent(db, agent_id=agent_id, skip=skip, limit=limit)
