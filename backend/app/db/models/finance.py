from sqlalchemy import Column, String, DateTime, func, ForeignKey, Numeric, Date, UniqueConstraint
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(50), nullable=False) # 'income' or 'expense'
    category = Column(String(100), nullable=False)
    transaction_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "category", name="uq_budget_user_category"),
    )
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    monthly_limit = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="budgets")
