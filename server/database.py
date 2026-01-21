from sqlmodel import create_engine, Session, SQLModel
from config import CONFIG

# 判定是否为 SQLite 决定是否添加 check_same_thread
connect_args = {"check_same_thread": False} if CONFIG.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(CONFIG.DATABASE_URL, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)

# 模拟 Redis 行为
class MockRedis:
    def __init__(self):
        self.store = {}

    async def set(self, key: str, value: str):
        self.store[key] = value

    async def get(self, key: str):
        return self.store.get(key)

    async def delete(self, key: str):
        if key in self.store:
            del self.store[key]

redis = MockRedis()