import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.prediction import Prediction
from backend.schemas.prediction_schema import PredictionCreate

def get_prediction(db: Session, prediction_id: uuid.UUID) -> Optional[Prediction]:
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()

def list_predictions(db: Session, skip: int = 0, limit: int = 100) -> List[Prediction]:
    return db.query(Prediction).offset(skip).limit(limit).all()

def get_predictions_by_incident(db: Session, incident_id: uuid.UUID) -> List[Prediction]:
    return db.query(Prediction).filter(Prediction.incident_id == incident_id).all()

def create_prediction(db: Session, prediction_in: PredictionCreate) -> Prediction:
    prediction = Prediction(
        incident_id=prediction_in.incident_id,
        predicted_next_step=prediction_in.predicted_next_step,
        probability=prediction_in.probability,
        mitre_tactic=prediction_in.mitre_tactic,
        mitre_technique=prediction_in.mitre_technique,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction
