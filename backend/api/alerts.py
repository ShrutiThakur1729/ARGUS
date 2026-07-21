import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.alert_schema import AlertCreate, AlertUpdate, AlertResponse
from backend.services import alert_service
from backend.models.user import User

router = APIRouter()

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return alert_service.create_alert(db, alert_in)

@router.get("/", response_model=List[AlertResponse])
def list_alerts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return alert_service.list_alerts(db, skip=skip, limit=limit)

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = alert_service.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: uuid.UUID,
    alert_up: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = alert_service.update_alert(db, alert_id, alert_up)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
