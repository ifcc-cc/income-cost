import os
from datetime import timedelta

class Config:
    JWT_ACCESS_SECRET = "access-secret-key-very-secure"
    JWT_REFRESH_SECRET = "refresh-secret-key-even-more-secure"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    ALGORITHM = "HS256"
    DATABASE_URL = "sqlite:///./dev.db"

CONFIG = Config()
