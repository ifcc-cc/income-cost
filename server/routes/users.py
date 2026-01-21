from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select, func
from database import get_session
from models import User, Transaction, Asset
from auth import get_current_user_id, get_password_hash, verify_password
from schemas import UserMeResponse, TransactionRead
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import joinedload
import os
import uuid

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # 验证文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images are allowed")
    
    # 生成唯一文件名
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("data/uploads", filename)
    
    # 保存文件
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # 更新用户头像路径
    user = session.get(User, user_id)
    if user:
        user.avatar = f"/uploads/{filename}"
        session.add(user)
        session.commit()
        session.refresh(user)
    
    return {"avatarUrl": user.avatar}

class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str

class UpdateProfileRequest(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None

@router.put("/me")
async def update_profile(
    data: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.nickname:
        user.nickname = data.nickname
    if data.avatar:
        user.avatar = data.avatar
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user or not verify_password(data.oldPassword, user.password):
        raise HTTPException(status_code=400, detail="旧密码错误")
    
    user.password = get_password_hash(data.newPassword)
    session.add(user)
    session.commit()
    return {"message": "密码修改成功"}

@router.get("/me", response_model=UserMeResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 获取资产列表
    statement = select(Asset).where(Asset.userId == user_id)
    assets = session.exec(statement).all()
    
    # 统计总额
    balance = sum(a.balance for a in assets)
    
    # 统计本月收支
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "income",
        Transaction.date >= month_start
    )
    expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "expense",
        Transaction.date >= month_start
    )
    
    monthly_income = session.exec(income_stmt).first() or 0.0
    monthly_expense = session.exec(expense_stmt).first() or 0.0
    
    return {
        "user": user.dict(),
        "assets": assets,
        "stats": {
            "balance": balance,
            "monthlyIncome": monthly_income,
            "monthlyExpense": monthly_expense
        }
    }

@router.get("/stats")
async def get_complex_stats(
    type: str = "month", # "month" or "year"
    year: int = None,
    month: int = None,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if not year:
        year = datetime.now().year
    
    # 确定时间范围
    if type == "month":
        if not month:
            month = datetime.now().month
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
    else:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)

    # 1. 基础收支统计
    income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date < end_date
    )
    expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.userId == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date < end_date
    )
    
    total_income = session.exec(income_stmt).first() or 0.0
    total_expense = session.exec(expense_stmt).first() or 0.0

    # 2. 按分类统计收支排行 (公用逻辑)
    def get_cat_stats(t_type: str):
        stmt = select(
            Transaction.categoryId,
            Transaction.categoryName,
            func.sum(Transaction.amount).label("amount")
        ).where(
            Transaction.userId == user_id,
            Transaction.type == t_type,
            Transaction.date >= start_date,
            Transaction.date < end_date
        ).group_by(Transaction.categoryId, Transaction.categoryName).order_by(func.sum(Transaction.amount).desc())
        
        results = session.exec(stmt).all()
        total = total_income if t_type == "income" else total_expense
        
        categories = []
        for row in results:
            percentage = int((row.amount / total * 100)) if total > 0 else 0
            categories.append({
                "categoryId": row.categoryId,
                "categoryName": row.categoryName,
                "amount": row.amount,
                "percentage": percentage
            })
        return categories

    return {
        "monthlyIncome": total_income,
        "monthlyExpense": total_expense,
        "expenseCategories": get_cat_stats("expense"),
        "incomeCategories": get_cat_stats("income")
    }

@router.get("/stats/category/{category_id}", response_model=List[TransactionRead])
async def get_category_transactions(
    category_id: str,
    type: str = "expense",
    year: int = None,
    month: int = None,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # 确定时间范围
    if not year: year = datetime.now().year
    if month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
    else:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)

    statement = select(Transaction).where(
        Transaction.userId == user_id,
        Transaction.categoryId == category_id,
        Transaction.type == type,
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).options(joinedload(Transaction.asset)).order_by(Transaction.amount.desc())
    
    return session.exec(statement).all()