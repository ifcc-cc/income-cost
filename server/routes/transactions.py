from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, desc
from typing import List
from database import get_session
from models import Transaction
from schemas import TransactionCreate, TransactionRead
from auth import get_current_user_id

router = APIRouter(tags=["transactions"])

@router.post("/transactions", response_model=TransactionRead)
async def create_transaction(
    data: TransactionCreate, 
    user_id: str = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    db_transaction = Transaction(**data.dict(), userId=user_id)
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.get("/transactions", response_model=List[TransactionRead])
async def get_transactions(
    user_id: str = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    statement = select(Transaction).where(Transaction.userId == user_id).order_by(desc(Transaction.date)).limit(20)
    results = session.exec(statement).all()
    return results

@router.get("/stats/category")
async def get_category_stats(
    user_id: str = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    # 只统计支出
    statement = select(
        Transaction.categoryId, 
        Transaction.categoryName, 
        func.sum(Transaction.amount).label("total_amount")
    ).where(
        Transaction.userId == user_id,
        Transaction.type == "expense"
    ).group_by(
        Transaction.categoryId,
        Transaction.categoryName
    ).order_by(desc("total_amount"))
    
    results = session.exec(statement).all()
    
    total_expense = sum(r.total_amount for r in results)
    
    details = []
    for r in results:
        percentage = round((r.total_amount / total_expense) * 100) if total_expense > 0 else 0
        details.append({
            "categoryId": r.categoryId,
            "categoryName": r.categoryName,
            "amount": r.total_amount,
            "percentage": percentage
        })
        
    return {"totalExpense": total_expense, "details": details}