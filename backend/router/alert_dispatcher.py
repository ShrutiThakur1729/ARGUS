from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.alert_schema import AlertCreate
from backend.services.alert_service import create_alert
from backend.models.user import User

router = APIRouter()

@router.post("/dispatch", status_code=status.HTTP_200_OK)
def manual_dispatch(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually create and dispatch an alert, triggering notifications if severity is high/critical.
    """
    alert = create_alert(db, alert_in)
    return {"status": "dispatched", "alert_id": alert.id, "severity": alert.severity}
