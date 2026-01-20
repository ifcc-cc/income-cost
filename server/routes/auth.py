from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session, redis
from models import User
from schemas import UserCreate, UserLogin, Token, TokenRefresh
from auth import get_password_hash, verify_password, create_tokens, create_token, get_current_user_id
from config import CONFIG
from jose import jwt, JWTError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="注册失败，邮箱可能已被使用")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password=hashed_pwd,
        nickname=user_data.nickname or "新用户"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "注册成功", "userId": new_user.id}

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=400, detail="用户不存在或密码错误")
    
    access_token, refresh_token = create_tokens(user.id)
    await redis.set(f"refresh_token:{user.id}", refresh_token)
    
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": {"id": user.id, "email": user.email, "nickname": user.nickname}
    }

@router.post("/refresh-token")
async def refresh_token(data: TokenRefresh):
    try:
        payload = jwt.decode(data.refreshToken, CONFIG.JWT_REFRESH_SECRET, algorithms=[CONFIG.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or payload.get("type") != "refresh":
            raise HTTPException(status_code=403, detail="Invalid Refresh Token")
        
        stored_token = await redis.get(f"refresh_token:{user_id}")
        if stored_token != data.refreshToken:
            raise HTTPException(status_code=403, detail="Token 已失效或被撤销")
        
        new_access_token = create_token(
            data={"sub": user_id, "type": "access"},
            expires_delta=None,
            secret=CONFIG.JWT_ACCESS_SECRET
        )
        return {"accessToken": new_access_token}
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid Refresh Token")

@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user_id)):
    await redis.delete(f"refresh_token:{user_id}")
    return {"message": "已退出登录"}