from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.user_schema import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    import requests
    import uuid
    import logging
    logger = logging.getLogger("argus.security")
    
    try:
        # Validate JWT token via Supabase Auth GET /user endpoint
        url = f"{settings.SUPABASE_URL}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY
        }
        response = requests.get(url, headers=headers, timeout=6)
        if response.status_code != 200:
            logger.error(f"Supabase Auth check failed: status {response.status_code}, details: {response.text}")
            raise credentials_exception
            
        supabase_user = response.json()
        email = supabase_user.get("email")
        user_id_str = supabase_user.get("id")
        user_id = uuid.UUID(user_id_str)
        metadata = supabase_user.get("user_metadata", {})
        username = metadata.get("full_name", email.split("@")[0])
        role = metadata.get("role", "analyst")
        
        # Ensure target columns exist on users table
        from sqlalchemy import text
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;"))
            db.commit()
        except Exception:
            db.rollback()

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(
                id=user_id,
                username=username,
                hashed_password="SUPABASE_AUTH_MANAGED",
                is_active=True,
                role=role
            )
            setattr(user, "email", email)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Sync metadata fields
            if getattr(user, "email", None) != email or user.username != username:
                setattr(user, "email", email)
                user.username = username
                db.commit()
                db.refresh(user)
                
        return user
        
    except Exception as e:
        logger.error(f"Supabase JWT validation exception: {e}")
        raise credentials_exception
