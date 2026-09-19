from pydantic import BaseModel
from typing import List

class SummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    transaction_count: int

class MonthlyItem(BaseModel):
    month: str
    income: float
    expense: float

class CategoryItem(BaseModel):
    category: str
    amount: float

class BudgetProgress(BaseModel):
    category: str
    monthly_limit: float
    spent: float
    remaining: float
    percentage: float
