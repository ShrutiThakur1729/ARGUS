import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.alert import Alert
from backend.schemas.alert_schema import AlertCreate, AlertUpdate
from backend.services.notification_service import notification_service

def get_alert(db: Session, alert_id: uuid.UUID) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == alert_id).first()

def list_alerts(db: Session, skip: int = 0, limit: int = 100) -> List[Alert]:
    return db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()

def create_alert(db: Session, alert_in: AlertCreate) -> Alert:
    alert = Alert(
        agent_id=alert_in.agent_id,
        telemetry_id=alert_in.telemetry_id,
        title=alert_in.title,
        description=alert_in.description,
        severity=alert_in.severity,
        status=alert_in.status,
        mitre_tactic=alert_in.mitre_tactic,
        mitre_technique=alert_in.mitre_technique,
        mitre_technique_id=alert_in.mitre_technique_id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch alerts via notification service (Telegram/In-app)
    if alert.severity.lower() in ("high", "critical"):
        msg = alert.description or "No description provided."
        if alert.mitre_technique_id:
            msg += f"\nMITRE ATT&CK: {alert.mitre_technique_id} - {alert.mitre_technique}"
        notification_service.dispatch(
            title=f"Security Alert: {alert.title}",
            message=msg,
            severity=alert.severity
        )
    return alert

def update_alert(db: Session, alert_id: uuid.UUID, alert_up: AlertUpdate) -> Optional[Alert]:
    alert = get_alert(db, alert_id)
    if not alert:
        return None
    
    update_data = alert_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(alert, key, value)
        
    db.commit()
    db.refresh(alert)
    return alert
