from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.finance import Transaction, Budget
from app.api.deps import get_current_user

router = APIRouter(prefix="/data", tags=["data"])

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(Transaction.__table__.delete().where(Transaction.user_id == current_user.id))
    await db.execute(Budget.__table__.delete().where(Budget.user_id == current_user.id))
    await db.commit()
    return None
