import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str
    role: str = "analyst"
    email: str = "analyst@aiims.edu"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
