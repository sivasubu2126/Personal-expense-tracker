from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.finance import Transaction
from app.schemas.finance import TransactionCreate, TransactionUpdate, TransactionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_txn = Transaction(
        user_id=current_user.id,
        description=transaction_in.description,
        amount=transaction_in.amount,
        type=transaction_in.type,
        category=transaction_in.category,
        transaction_date=transaction_in.transaction_date
    )
    db.add(new_txn)
    await db.commit()
    await db.refresh(new_txn)
    return new_txn

@router.get("/{id}", response_model=TransactionResponse)
async def get_transaction(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == id, Transaction.user_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.put("/{id}", response_model=TransactionResponse)
async def update_transaction(
    id: str,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == id, Transaction.user_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    update_data = transaction_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(txn, field, value)
        
    await db.commit()
    await db.refresh(txn)
    return txn

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == id, Transaction.user_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    await db.delete(txn)
    await db.commit()
    return None
