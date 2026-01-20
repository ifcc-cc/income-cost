from typing import Optional, List
from pydantic import BaseModel
from models import UserBase, TransactionBase

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    user: dict

class TokenRefresh(BaseModel):
    refreshToken: str

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: str
    userId: str

class CategoryStat(BaseModel):
    categoryId: str
    categoryName: str
    amount: float
    percentage: int

class UserStats(BaseModel):
    balance: float
    monthlyIncome: float
    monthlyExpense: float

class UserMeResponse(BaseModel):
    user: dict
    stats: UserStats