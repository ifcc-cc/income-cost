from typing import Optional, List
from datetime import datetime
import uuid
from sqlmodel import SQLModel, Field, Relationship

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    nickname: Optional[str] = None
    avatar: Optional[str] = None

class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    transactions: List["Transaction"] = Relationship(back_populates="user")
    assets: List["Asset"] = Relationship(back_populates="user")

class AssetBase(SQLModel):
    name: str
    type: str  # "bank", "stock", "fund", "cash", "other"
    balance: float = Field(default=0.0)
    icon: Optional[str] = None
    color: Optional[str] = None

class Asset(AssetBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    userId: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="assets")
    transactions: List["Transaction"] = Relationship(back_populates="asset")

class TransactionBase(SQLModel):
    amount: float
    type: str  # "income" | "expense"
    categoryId: str
    categoryName: str
    date: datetime
    note: Optional[str] = None
    assetId: Optional[str] = Field(default=None, foreign_key="asset.id")

class Transaction(TransactionBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    userId: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="transactions")
    asset: Optional[Asset] = Relationship(back_populates="transactions")