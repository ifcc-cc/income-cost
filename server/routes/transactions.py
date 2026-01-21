from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, desc
from typing import List
from database import get_session
from models import Transaction, Asset
from schemas import TransactionCreate, TransactionRead
from auth import get_current_user_id

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionRead)
async def create_transaction(
    transaction_data: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # 创建账单记录
    transaction = Transaction(**transaction_data.dict(), userId=user_id)
    session.add(transaction)
    
    # 如果关联了资产账户，更新余额
    if transaction.assetId:
        asset = session.get(Asset, transaction.assetId)
        if asset and asset.userId == user_id:
            if transaction.type == "expense":
                asset.balance -= transaction.amount
            else:
                asset.balance += transaction.amount
            session.add(asset)
    
    session.commit()
    session.refresh(transaction)
    return transaction

@router.put("/{transaction_id}", response_model=TransactionRead)
async def update_transaction(
    transaction_id: str,
    data: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.userId != user_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # 1. 回滚旧资产余额
    if transaction.assetId:
        old_asset = session.get(Asset, transaction.assetId)
        if old_asset:
            if transaction.type == "expense":
                old_asset.balance += transaction.amount
            else:
                old_asset.balance -= transaction.amount
            session.add(old_asset)

    # 2. 更新账单数据
    for key, value in data.dict().items():
        setattr(transaction, key, value)
    
    # 3. 应用新资产余额
    if transaction.assetId:
        new_asset = session.get(Asset, transaction.assetId)
        if new_asset:
            if transaction.type == "expense":
                new_asset.balance -= transaction.amount
            else:
                new_asset.balance += transaction.amount
            session.add(new_asset)
            
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.userId != user_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # 回滚资产余额
    if transaction.assetId:
        asset = session.get(Asset, transaction.assetId)
        if asset:
            if transaction.type == "expense":
                asset.balance += transaction.amount
            else:
                asset.balance -= transaction.amount
            session.add(asset)
            
    session.delete(transaction)
    session.commit()
    return {"message": "Deleted"}

@router.get("/", response_model=List[TransactionRead])
async def get_transactions(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # 多重排序：先按业务日期倒序，同一天按录入时间倒序
    statement = select(Transaction).where(Transaction.userId == user_id).order_by(Transaction.date.desc(), Transaction.created_at.desc())
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