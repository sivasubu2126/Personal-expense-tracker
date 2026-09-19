from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from typing import List

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.finance import Budget
from app.schemas.finance import BudgetCreate, BudgetUpdate, BudgetResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("", response_model=List[BudgetResponse])
async def get_budgets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Budget).where(Budget.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_budget = Budget(
        user_id=current_user.id,
        category=budget_in.category,
        monthly_limit=budget_in.monthly_limit
    )
    db.add(new_budget)
    try:
        await db.commit()
        await db.refresh(new_budget)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Budget for this category already exists")
    
    return new_budget

@router.get("/{id}", response_model=BudgetResponse)
async def get_budget(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Budget).where(Budget.id == id, Budget.user_id == current_user.id)
    )
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/{id}", response_model=BudgetResponse)
async def update_budget(
    id: str,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Budget).where(Budget.id == id, Budget.user_id == current_user.id)
    )
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    budget.monthly_limit = budget_in.monthly_limit
    await db.commit()
    await db.refresh(budget)
    return budget

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Budget).where(Budget.id == id, Budget.user_id == current_user.id)
    )
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    await db.delete(budget)
    await db.commit()
    return None
