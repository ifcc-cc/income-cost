import os
from datetime import timedelta

class Config:
    JWT_ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET", "access-secret-key-very-secure")
    JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "refresh-secret-key-even-more-secure")
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    ALGORITHM = "HS256"
    
    # Uploads
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "data", "uploads"))
    
    # 生产环境通过环境变量注入，本地开发默认使用远程 Postgres 的开发库
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:lpk123030@192.168.0.218:5432/expense_tracker_dev")

CONFIG = Config()
