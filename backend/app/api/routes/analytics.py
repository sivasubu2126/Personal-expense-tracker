from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case
from typing import List

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.finance import Transaction
from app.schemas.analytics import SummaryResponse, MonthlyItem, CategoryItem
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=SummaryResponse)
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(
            func.sum(case((Transaction.type == 'income', Transaction.amount), else_=0)),
            func.sum(case((Transaction.type == 'expense', Transaction.amount), else_=0)),
            func.count(Transaction.id)
        ).where(Transaction.user_id == current_user.id)
    )
    income, expense, count = result.first()
    income = float(income or 0)
    expense = float(expense or 0)
    
    return {
        "total_income": income,
        "total_expense": expense,
        "balance": income - expense,
        "transaction_count": count
    }

@router.get("/monthly", response_model=List[MonthlyItem])
async def get_monthly(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # This format is valid for MySQL
    month_expr = func.date_format(Transaction.transaction_date, '%Y-%m')
    
    result = await db.execute(
        select(
            month_expr.label("month"),
            func.sum(case((Transaction.type == 'income', Transaction.amount), else_=0)).label("income"),
            func.sum(case((Transaction.type == 'expense', Transaction.amount), else_=0)).label("expense")
        )
        .where(Transaction.user_id == current_user.id)
        .group_by(month_expr)
        .order_by(month_expr)
    )
    
    items = []
    for row in result.all():
        items.append({
            "month": row.month,
            "income": float(row.income or 0),
            "expense": float(row.expense or 0)
        })
    return items

@router.get("/categories", response_model=List[CategoryItem])
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("amount")
        )
        .where(Transaction.user_id == current_user.id, Transaction.type == 'expense')
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    )
    
    items = []
    for row in result.all():
        items.append({
            "category": row.category,
            "amount": float(row.amount or 0)
        })
    return items
