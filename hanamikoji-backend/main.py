import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 導入設定檔
from app.config.settings import settings
from app.database.connection import get_db
from app.database.mongodb import init_mongodb
from app.domain.factories.game_factory import GameInitializationService
from app.api.routes import game, room

# 建立 FastAPI 應用程式
app = FastAPI(
    title=settings.app_name,
    description="花見小路卡牌遊戲後端 API",
    version="1.0.0",
    debug=settings.debug
)

# CORS 設定（讓前端可以連接）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 基本健康檢查端點
@app.get("/")
async def root():
    """根路由 - API 狀態檢查"""
    return {
        "message": "花見小路遊戲 API",
        "status": "running",
        "version": "1.0.0",
        "environment": settings.environment
    }


# 健康檢查端點
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """健康檢查端點"""
    try:
        # 測試資料庫連接
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "environment": settings.environment
    }


@app.get("/games")
async def games():
    service = GameInitializationService()
    return service.initialize_new_game("玩家1", "玩家2")

# API 路由組
app.include_router(game.router, prefix="/api/v1/games", tags=["games"])
app.include_router(room.router, prefix="/api/v1/rooms", tags=["rooms"])

# 靜態檔案服務（如果需要）
# app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    print("🎌 花見小路遊戲後端啟動中...")
    print(f"🔧 環境: {settings.environment}")
    print(f"🐛 除錯模式: {settings.debug}")
    
    # 初始化 MongoDB
    init_mongodb()

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,  # 開發環境自動重載
        log_level="info" if settings.debug else "warning"
    )
