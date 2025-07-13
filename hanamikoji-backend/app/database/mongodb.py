"""MongoDB連接和配置"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import asyncio

from app.config.settings import settings


class MongoDB:
    """MongoDB連接管理器"""
    
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.async_client: Optional[AsyncIOMotorClient] = None
        self.database = None
        self.async_database = None
    
    def connect(self):
        """建立同步MongoDB連接"""
        try:
            self.client = MongoClient(settings.mongodb_url)
            self.database = self.client[settings.mongodb_db_name]
            
            # 測試連接
            self.client.admin.command('ping')
            print(f"✅ MongoDB連接成功: {settings.mongodb_url}")
            return True
        except Exception as e:
            print(f"❌ MongoDB連接失敗: {e}")
            return False
    
    async def async_connect(self):
        """建立異步MongoDB連接"""
        try:
            self.async_client = AsyncIOMotorClient(settings.mongodb_url)
            self.async_database = self.async_client[settings.mongodb_db_name]
            
            # 測試連接
            await self.async_client.admin.command('ping')
            print(f"✅ MongoDB異步連接成功: {settings.mongodb_url}")
            return True
        except Exception as e:
            print(f"❌ MongoDB異步連接失敗: {e}")
            return False
    
    def disconnect(self):
        """關閉MongoDB連接"""
        if self.client:
            self.client.close()
            print("🔌 MongoDB連接已關閉")
    
    async def async_disconnect(self):
        """關閉異步MongoDB連接"""
        if self.async_client:
            self.async_client.close()
            print("🔌 MongoDB異步連接已關閉")
    
    def get_collection(self, collection_name: str):
        """獲取同步集合"""
        if self.database is None:
            raise RuntimeError("MongoDB未連接")
        return self.database[collection_name]
    
    def get_async_collection(self, collection_name: str):
        """獲取異步集合"""
        if not self.async_database:
            raise RuntimeError("MongoDB異步連接未建立")
        return self.async_database[collection_name]


# 全域MongoDB實例
mongodb = MongoDB()


def get_mongodb():
    """FastAPI依賴注入用的MongoDB實例"""
    if mongodb.database is None:
        mongodb.connect()
    return mongodb


async def get_async_mongodb():
    """FastAPI異步依賴注入用的MongoDB實例"""
    if not mongodb.async_database:
        await mongodb.async_connect()
    return mongodb


# 集合名稱常量
class Collections:
    """MongoDB集合名稱"""
    GAMES = "games"
    PLAYERS = "players"
    GAME_LOGS = "game_logs"
    GEISHAS = "geishas"
    CARDS = "cards"


def init_mongodb():
    """初始化MongoDB連接"""
    success = mongodb.connect()
    if success:
        print("🎮 花見小路遊戲MongoDB已就緒")
        return True
    else:
        print("⚠️  MongoDB連接失敗，將使用內存儲存")
        return False