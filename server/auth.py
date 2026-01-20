from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import CONFIG

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_tokens(user_id: str):
    access_token_expires = timedelta(minutes=CONFIG.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=CONFIG.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_token(
        data={"sub": user_id, "type": "access"}, 
        expires_delta=access_token_expires,
        secret=CONFIG.JWT_ACCESS_SECRET
    )
    refresh_token = create_token(
        data={"sub": user_id, "type": "refresh"}, 
        expires_delta=refresh_token_expires,
        secret=CONFIG.JWT_REFRESH_SECRET
    )
    return access_token, refresh_token

def create_token(data: dict, expires_delta: Optional[timedelta] = None, secret: str = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret, algorithm=CONFIG.ALGORITHM)
    return encoded_jwt

async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, CONFIG.JWT_ACCESS_SECRET, algorithms=[CONFIG.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or payload.get("type") != "access":
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception