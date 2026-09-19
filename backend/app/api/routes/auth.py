from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
import datetime

from app.db.database import get_db
from app.db.models.user import User, RefreshToken
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token, ChangePassword
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

from sqlalchemy import func

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    clean_name = user_data.name.strip()
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
    if result.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")
        
    new_user = User(
        name=clean_name,
        email=clean_email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
    user = result.scalars().first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = str(uuid.uuid4())
    
    db_token = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=settings.refresh_token_expire_days)
    )
    db.add(db_token)
    await db.commit()
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite=settings.cookie_samesite,
        secure=settings.secure_cookies,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh(response: Response, refresh_token: str = Cookie(None), db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token == refresh_token)
        .where(RefreshToken.expires_at > datetime.datetime.now(datetime.timezone.utc))
        .with_for_update()
    )
    db_token = result.scalars().first()
    
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    access_token = create_access_token(data={"sub": db_token.user_id})
    
    # Rotate refresh token
    new_refresh_token = str(uuid.uuid4())
    db_token.token = new_refresh_token
    db_token.expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=settings.refresh_token_expire_days)
    await db.commit()
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite=settings.cookie_samesite,
        secure=settings.secure_cookies,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(response: Response, refresh_token: str = Cookie(None), db: AsyncSession = Depends(get_db)):
    if refresh_token:
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
        db_token = result.scalars().first()
        if db_token:
            await db.delete(db_token)
            await db.commit()
            
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect current password")
        
    current_user.password_hash = get_password_hash(data.new_password)
    
    # Revoke all existing refresh tokens to force re-login on other devices
    await db.execute(
        RefreshToken.__table__.delete().where(RefreshToken.user_id == current_user.id)
    )
    
    await db.commit()
    return {"message": "Password changed successfully"}
