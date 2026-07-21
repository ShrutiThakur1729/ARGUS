import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.prediction_schema import PredictionCreate, PredictionResponse
from backend.services import prediction_service
from backend.models.user import User

router = APIRouter()

@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(
    prediction_in: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return prediction_service.create_prediction(db, prediction_in)

@router.get("/", response_model=List[PredictionResponse])
def list_predictions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return prediction_service.list_predictions(db, skip=skip, limit=limit)

@router.get("/incident/{incident_id}", response_model=List[PredictionResponse])
def get_incident_predictions(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return prediction_service.get_predictions_by_incident(db, incident_id)

@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = prediction_service.get_prediction(db, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction
