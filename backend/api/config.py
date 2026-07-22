import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.organization import Organization

router = APIRouter()

# Schema models representing what the frontend expects
class OrgSettingsRequest(BaseModel):
    name: str
    department: Optional[str] = None
    faculty: Optional[str] = None
    institution: str
    location: Optional[str] = None # Maps to country
    email: str
    logo: Optional[str] = None
    timezone: str
    website: Optional[str] = None

class OrgSettingsResponse(BaseModel):
    name: str
    department: str
    faculty: str
    institution: str
    location: str
    email: str
    logo: str
    timezone: str
    website: str

@router.get("/org", response_model=OrgSettingsResponse)
def get_org_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = None
    if current_user.organization_id:
        org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
        
    if not org:
        # Fallback: get first org in DB
        org = db.query(Organization).first()
        
    if not org:
        # Create a default org record in PostgreSQL
        org = Organization(
            name="AIIMS Delhi CNI",
            institution="All India Institute of Medical Sciences",
            department="Department of Critical Cybersecurity",
            country="India",
            timezone="IST (UTC+05:30)",
            logo="/assets/logo.svg",
            email="cni-security@aiims.edu",
            website="https://aiims.edu"
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        
        # Link current user
        current_user.organization_id = org.id
        db.commit()
        
    return {
        "name": org.name,
        "department": org.department or "Department of Critical Cybersecurity",
        "faculty": org.department or "Cybersecurity and Forensics Faculty",
        "institution": org.institution,
        "location": org.country,
        "email": org.email,
        "logo": org.logo or "/assets/logo.svg",
        "timezone": org.timezone,
        "website": org.website or ""
    }

@router.put("/org", response_model=OrgSettingsResponse)
def update_org_settings(
    settings_in: OrgSettingsRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    org = None
    if current_user.organization_id:
        org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
        
    if not org:
        # Fallback: get first org in DB
        org = db.query(Organization).first()
        
    if not org:
        org = Organization(
            name=settings_in.name,
            institution=settings_in.institution,
            department=settings_in.department or settings_in.faculty,
            country=settings_in.location or "India",
            timezone=settings_in.timezone,
            logo=settings_in.logo,
            email=settings_in.email,
            website=settings_in.website
        )
        db.add(org)
        db.commit()
        db.refresh(org)
    else:
        org.name = settings_in.name
        org.institution = settings_in.institution
        org.department = settings_in.department or settings_in.faculty
        org.country = settings_in.location or "India"
        org.timezone = settings_in.timezone
        org.logo = settings_in.logo
        org.email = settings_in.email
        org.website = settings_in.website
        db.commit()
        db.refresh(org)
        
    # Associate user
    if current_user.organization_id != org.id:
        current_user.organization_id = org.id
        db.commit()
        
    return {
        "name": org.name,
        "department": org.department or "Department of Critical Cybersecurity",
        "faculty": org.department or "Cybersecurity and Forensics Faculty",
        "institution": org.institution,
        "location": org.country,
        "email": org.email,
        "logo": org.logo or "/assets/logo.svg",
        "timezone": org.timezone,
        "website": org.website or ""
    }
