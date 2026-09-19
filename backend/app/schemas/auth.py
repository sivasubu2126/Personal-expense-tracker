from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
