from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import traceback
import os
from database import init_db
from routes import auth, users, transactions, assets
from config import CONFIG

app = FastAPI(title="Expense Tracker API")

# 确保上传目录存在
if not os.path.exists(CONFIG.UPLOAD_DIR):
    os.makedirs(CONFIG.UPLOAD_DIR, exist_ok=True)

# 挂载静态文件
app.mount("/uploads", StaticFiles(directory=CONFIG.UPLOAD_DIR), name="uploads")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception caught: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(assets.router)

@app.get("/")
async def root():
    return {"message": "Expense Tracker API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=3000, reload=True)