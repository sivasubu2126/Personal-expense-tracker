from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from typing import Optional, Literal

# Transaction Schemas
class TransactionBase(BaseModel):
    description: str
    amount: float = Field(..., gt=0)
    type: Literal['income', 'expense']
    category: str
    transaction_date: date

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[Literal['income', 'expense']] = None
    category: Optional[str] = None
    transaction_date: Optional[date] = None

class TransactionResponse(TransactionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    monthly_limit: float = Field(..., gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    monthly_limit: float = Field(..., gt=0)

class BudgetResponse(BudgetBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
