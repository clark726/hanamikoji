from typing import Generator

from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    """FastAPI 依賴注入用的資料庫 Session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DatabaseManager:
    """資料庫管理器"""

    @staticmethod
    def get_session() -> Session:
        """建立新的資料庫 Session"""
        return SessionLocal()

    @staticmethod
    def close_session(session: Session):
        """關閉資料庫 Session"""
        session.close()


# 全域資料庫管理器
db_manager = DatabaseManager()

# app/database/session.py
from contextlib import contextmanager
from .config import SessionLocal


@contextmanager
def get_db_session():
    """資料庫 Session 上下文管理器"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()