from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Asset
from schemas import AssetCreate, AssetRead
from auth import get_current_user_id
from typing import List

router = APIRouter(prefix="/assets", tags=["assets"])

@router.post("/", response_model=AssetRead)
async def create_asset(
    asset_data: AssetCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    asset = Asset(**asset_data.dict(), userId=user_id)
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset

@router.get("/", response_model=List[AssetRead])
async def get_assets(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    statement = select(Asset).where(Asset.userId == user_id)
    return session.exec(statement).all()

@router.put("/{asset_id}", response_model=AssetRead)
async def update_asset(
    asset_id: str,
    asset_data: AssetCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    asset = session.get(Asset, asset_id)
    if not asset or asset.userId != user_id:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset_data.dict().items():
        setattr(asset, key, value)
    
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    asset = session.get(Asset, asset_id)
    if not asset or asset.userId != user_id:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    session.delete(asset)
    session.commit()
    return {"message": "Asset deleted"}
