from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import logging

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.alert_schema import AlertCreate
from backend.services.alert_service import create_alert
from backend.models.user import User
from backend.models.incident import Incident
from backend.models.alert import Alert

logger = logging.getLogger("argus.dispatcher")
router = APIRouter()

class SimulationRequest(BaseModel):
    scenario: str

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

@router.post("/simulate", status_code=status.HTTP_201_CREATED)
def simulate_scenario(
    req: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulates a specific cyber attack scenario by generating incidents, alerts, AI predictions, and Telegram dispatches.
    """
    scenarios = {
        "SQL Injection": {
            "title": "Database Integrity Exploit: SQL Injection Attempt",
            "desc": "An adversary attempted a SQL injection exploit on the authentication backend database endpoint to extract database schemas and administrator passwords.",
            "tactic": "Initial Access",
            "tech": "Exploit Public-Facing Application",
            "tech_id": "T1190"
        },
        "Ransomware": {
            "title": "Active Host Encryption: Ransomware Deployment",
            "desc": "Ransomware binary detected actively encrypting files on the shared network drives, leaving shadow volume restore logs corrupted.",
            "tactic": "Impact",
            "tech": "Data Encrypted for Impact",
            "tech_id": "T1486"
        },
        "Brute Force": {
            "title": "Gateway Access Failure: Credential Brute Force",
            "desc": "A massive password spraying brute force campaign detected originating from unknown proxy networks targeting gateway servers.",
            "tactic": "Credential Access",
            "tech": "Brute Force",
            "tech_id": "T1110"
        },
        "Data Exfiltration": {
            "title": "Unauthorized Database Dump: Data Exfiltration",
            "desc": "Large outbound data transfers detected targeting external cloud server IPs, containing matching database backups.",
            "tactic": "Exfiltration",
            "tech": "Exfiltration Over Web Service",
            "tech_id": "T1567"
        },
        "Privilege Escalation": {
            "title": "Administrative Compromise: Privilege Escalation",
            "desc": "Standard user account credentials used to modify administrative rights, violating role access control rules.",
            "tactic": "Privilege Escalation",
            "tech": "Domain Policy Modification",
            "tech_id": "T1484"
        },
        "Insider Threat": {
            "title": "System Tampering: Insider Malicious Threat",
            "desc": "An authorized system operator executed critical script commands outside regular maintenance windows to access restricted records.",
            "tactic": "Collection",
            "tech": "Data from Local System",
            "tech_id": "T1005"
        },
        "Malware Beaconing": {
            "title": "C2 Remote Command: Malware Beaconing Channel",
            "desc": "An internal server node observed periodically beaconing commands to a known command-and-control IP address.",
            "tactic": "Command and Control",
            "tech": "Application Layer Protocol",
            "tech_id": "T1071"
        }
    }

    sc = scenarios.get(req.scenario)
    if not sc:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown simulation scenario. Supported: {list(scenarios.keys())}"
        )

    # 1. Create database incident row
    inc = Incident(
        title=f"[SIMULATION] {sc['title']}",
        description=f"SIMULATION RUN TIME: {req.scenario}. Details: {sc['desc']}",
        status="open",
        severity="critical",
        assigned_to=current_user.username
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    # 2. Create database alert linked to the incident
    alert_in = AlertCreate(
        incident_id=inc.id,
        title=f"Security Alert: {sc['title']}",
        description=f"[SIMULATION ALERT] {sc['desc']}",
        severity="critical",
        status="open",
        mitre_tactic=sc["tactic"],
        mitre_technique=sc["tech"],
        mitre_technique_id=sc["tech_id"]
    )
    alert = create_alert(db, alert_in)
    
    # 3. Create mock delivery log in reports history
    try:
        from backend.api.reports import load_history, save_history
        history = load_history()
        new_report = {
            "id": str(uuid.uuid4()),
            "title": f"Simulation Threat Report - {req.scenario}",
            "file_type": "pdf",
            "recipient_email": getattr(current_user, "email", "analyst@aiims.edu") or "analyst@aiims.edu",
            "content": f"========================================\nSIMULATION REPORT: {req.scenario}\n========================================\nDetails: {sc['desc']}",
            "status": "delivered",
            "size": "144 KB",
            "timestamp": inc.created_at.isoformat()
        }
        history.insert(0, new_report)
        save_history(history)
    except Exception as e:
        logger.error(f"Failed to save simulation report to history log: {e}")

    return {
        "status": "simulated",
        "message": f"Simulation run for scenario '{req.scenario}' succeeded.",
        "incident_id": inc.id,
        "alert_id": alert.id
    }
