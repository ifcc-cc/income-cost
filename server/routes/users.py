from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from database import get_session
from models import User, Transaction
from auth import get_current_user_id
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    
    # 统计本月收支
    income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "income",
        Transaction.date >= start_of_month
    )
    expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_of_month
    )
    
    monthly_income = session.exec(income_stmt).one() or 0
    monthly_expense = session.exec(expense_stmt).one() or 0
    
    # 计算总余额
    total_income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "income"
    )
    total_expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "expense"
    )
    
    total_income = session.exec(total_income_stmt).one() or 0
    total_expense = session.exec(total_expense_stmt).one() or 0
    balance = total_income - total_expense
    
    return {
        "user": {
            "id": user.id,
            "nickname": user.nickname,
            "email": user.email
        },
        "stats": {
            "balance": balance,
            "monthlyIncome": monthly_income,
            "monthlyExpense": monthly_expense
        }
    }