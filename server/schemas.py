from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from models import UserBase, TransactionBase, AssetBase

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AssetCreate(AssetBase):
    pass

class AssetRead(AssetBase):
    id: str

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
    created_at: datetime
    asset: Optional[AssetRead] = None

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
    assets: List[AssetRead]