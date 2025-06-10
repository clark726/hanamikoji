from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from app.config.settings import settings
import os

# 建立基礎模型類別
Base = declarative_base()


def create_database_directory():
    """確保資料庫目錄存在"""
    db_dir = os.path.dirname("./data/hanamikoji.db")
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"📁 建立資料庫目錄: {db_dir}")


def get_engine():
    """建立 SQLite 資料庫引擎"""
    # 確保資料庫目錄存在
    create_database_directory()

    # SQLite 特殊設定
    engine = create_engine(
        settings.database_url,
        echo=settings.db_echo,  # 顯示 SQL 語句（開發時有用）
        connect_args={
            "check_same_thread": False,  # 允許多執行緒存取
            "timeout": 20,  # 連線超時設定
        },
        poolclass=StaticPool,  # SQLite 使用靜態連線池
    )

    return engine


# 建立引擎和 Session
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)