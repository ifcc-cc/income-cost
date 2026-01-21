import os
from datetime import timedelta

class Config:
    JWT_ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET", "access-secret-key-very-secure")
    JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "refresh-secret-key-even-more-secure")
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    ALGORITHM = "HS256"
    # 生产环境通常会挂载 /app/data 目录，本地则直接存根目录
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

CONFIG = Config()
