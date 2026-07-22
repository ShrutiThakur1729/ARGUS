import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from backend.core.security import get_current_user
from backend.models.user import User

router = APIRouter()

HISTORY_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports_history.json")

class ReportBase(BaseModel):
    title: str
    file_type: str  # e.g., pdf, csv
    recipient_email: str
    content: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: str
    status: str  # e.g., delivered, failed
    size: str
    timestamp: str

def load_history() -> List[dict]:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_history(history: List[dict]):
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

@router.get("/", response_model=List[ReportResponse])
def get_reports_history(current_user: User = Depends(get_current_user)):
    return load_history()

@router.post("/send-email", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def send_email_report(report_in: ReportCreate, current_user: User = Depends(get_current_user)):
    from backend.services.email_service import email_service
    sent = email_service.send_report_email(
        title=report_in.title,
        file_type=report_in.file_type,
        recipient=report_in.recipient_email,
        content=report_in.content
    )
    
    history = load_history()
    
    new_report = {
        "id": str(uuid.uuid4()),
        "title": report_in.title,
        "file_type": report_in.file_type,
        "recipient_email": report_in.recipient_email,
        "content": report_in.content,
        "status": "delivered" if sent else "failed",
        "size": "2.4 MB" if report_in.file_type.lower() == "pdf" else "142 KB",
        "timestamp": datetime.now().isoformat()
    }
    
    history.insert(0, new_report)
    save_history(history)
    return new_report

@router.post("/{report_id}/resend", response_model=ReportResponse)
def resend_report(report_id: str, current_user: User = Depends(get_current_user)):
    history = load_history()
    report = None
    for r in history:
        if r["id"] == report_id:
            report = r
            break
            
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    from backend.services.email_service import email_service
    sent = email_service.send_report_email(
        title=report["title"],
        file_type=report["file_type"],
        recipient=report["recipient_email"],
        content=report.get("content")
    )
    
    report["status"] = "delivered" if sent else "failed"
    report["timestamp"] = datetime.now().isoformat()
    save_history(history)
    return report
