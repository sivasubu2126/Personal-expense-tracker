import datetime
import jwt
from passlib.hash import argon2
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return argon2.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return argon2.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm="HS256")
    return encoded_jwt
