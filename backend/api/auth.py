import requests
import uuid
import logging
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.config import settings
from backend.models.user import User
from backend.models.organization import Organization
from backend.schemas.user_schema import UserResponse, Token

logger = logging.getLogger("argus.auth")
router = APIRouter()

# Schema definitions
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "analyst"

class OrgRegisterRequest(BaseModel):
    org_name: str
    institution: str
    department: Optional[str] = None
    country: str
    timezone: str
    logo: Optional[str] = None
    website: Optional[str] = None
    
    admin_name: str
    email: str
    password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Sign up operator on Supabase Auth
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": user_in.email,
        "password": user_in.password,
        "data": {
            "full_name": user_in.username,
            "role": user_in.role
        }
    }
    res = requests.post(url, json=payload, headers=headers, timeout=10)
    if res.status_code != 200:
        logger.error(f"Supabase Auth signup failed: {res.text}")
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {res.text}"
        )
        
    resp_data = res.json()
    user_id_str = resp_data.get("id") or resp_data.get("user", {}).get("id")
    if not user_id_str:
        raise HTTPException(
            status_code=400,
            detail="Registration failed: Authentication provider did not return user ID."
        )
    
    user_id = uuid.UUID(user_id_str)
    
    # 2. Sync migrations
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;"))
        db.commit()
    except Exception:
        db.rollback()

    # 3. Create database shadow user
    user = User(
        id=user_id,
        username=user_in.username,
        hashed_password="SUPABASE_AUTH_MANAGED",
        is_active=True,
        role=user_in.role
    )
    setattr(user, "email", user_in.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/register-org", status_code=status.HTTP_201_CREATED)
def register_organization(req: OrgRegisterRequest, db: Session = Depends(get_db)):
    # 1. Sign up admin user on Supabase
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": req.email,
        "password": req.password,
        "data": {
            "full_name": req.admin_name,
            "role": "analyst"
        }
    }
    res = requests.post(url, json=payload, headers=headers, timeout=10)
    if res.status_code != 200:
        logger.error(f"Supabase signup failed: {res.text}")
        raise HTTPException(
            status_code=400,
            detail=f"Admin registration failed: {res.text}"
        )
        
    resp_data = res.json()
    user_id_str = resp_data.get("id") or resp_data.get("user", {}).get("id")
    if not user_id_str:
        raise HTTPException(
            status_code=400,
            detail="Registration failed: Authentication provider did not return user ID."
        )
    user_id = uuid.UUID(user_id_str)

    # Ensure tables and migrations exist
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;"))
        db.commit()
    except Exception:
        db.rollback()

    # 2. Insert new organization
    org = Organization(
        name=req.org_name,
        institution=req.institution,
        department=req.department,
        country=req.country,
        timezone=req.timezone,
        logo=req.logo,
        email=req.email,
        website=req.website
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # 3. Create local shadow user linked to organization
    user = User(
        id=user_id,
        username=req.admin_name,
        hashed_password="SUPABASE_AUTH_MANAGED",
        is_active=True,
        role="analyst",
        organization_id=org.id
    )
    setattr(user, "email", req.email)
    db.add(user)
    db.commit()

    return {
        "status": "success",
        "message": "Organization registered successfully. Check email for confirmation links.",
        "organization_id": org.id,
        "user_id": user_id
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authenticate via Supabase Auth GoTrue API
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": form_data.username, # standard OAuth2 uses 'username' field for email input
        "password": form_data.password
    }
    res = requests.post(url, json=payload, headers=headers, timeout=10)
    if res.status_code != 200:
        logger.error(f"Supabase token validation login failed: {res.text}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Verify credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    resp_data = res.json()
    access_token = resp_data.get("access_token")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    """Triggers Supabase password reset email via GoTrue REST API."""
    url = f"{settings.SUPABASE_URL}/auth/v1/recover"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }
    payload = {"email": req.email}
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        # Supabase returns 200 regardless of whether email exists (security best practice)
        return {
            "status": "success",
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    except Exception as e:
        logger.error(f"Password reset request failed: {e}")
        raise HTTPException(status_code=500, detail="Password reset service temporarily unavailable.")
