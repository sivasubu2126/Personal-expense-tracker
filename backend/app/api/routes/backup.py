from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
import datetime

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.finance import Transaction, Budget
from app.api.deps import get_current_user

router = APIRouter(prefix="/backup", tags=["backup"])

@router.post("/import")
async def import_backup(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if "transactions" not in data or "budgets" not in data:
        raise HTTPException(status_code=422, detail="Invalid backup format")
        
    transactions = data["transactions"]
    budgets = data["budgets"]
    
    txns_imported = 0
    budgets_imported = 0
    
    # Simple transaction-based insert
    try:
        # Delete existing data if any? Prompt doesn't explicitly say replace, but let's just add or replace depending on what they want.
        # Actually, let's just insert them directly as new records.
        for t in transactions:
            raw_date = t.get("transaction_date") or t.get("date") or datetime.date.today().isoformat()
            if isinstance(raw_date, datetime.date):
                txn_date = raw_date
            elif "T" in str(raw_date):
                txn_date = datetime.datetime.fromisoformat(str(raw_date).replace('Z', '+00:00')).date()
            else:
                txn_date = datetime.date.fromisoformat(str(raw_date))

            new_txn = Transaction(
                user_id=current_user.id,
                description=t.get("description", "Imported Transaction"),
                amount=float(t.get("amount", 0)),
                type=t.get("type", "expense"),
                category=t.get("category", "Other"),
                transaction_date=txn_date
            )
            db.add(new_txn)
            txns_imported += 1
            
        for b in budgets:
            # check if budget category exists, if so skip or update
            result = await db.execute(select(Budget).where(Budget.user_id == current_user.id, Budget.category == b["category"]))
            existing = result.scalars().first()
            if not existing:
                new_budget = Budget(
                    user_id=current_user.id,
                    category=b["category"],
                    monthly_limit=float(b["monthly_limit"])
                )
                db.add(new_budget)
                budgets_imported += 1
                
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")
        
    return {
        "transactions_imported": txns_imported,
        "budgets_imported": budgets_imported
    }
