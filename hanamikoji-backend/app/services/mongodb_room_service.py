"""MongoDB房間儲存服務"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import mongodb, Collections
from app.models.mongodb import RoomDocument, RoomPlayerDocument
from app.domain.entities.room import Room, RoomPlayer


class MongoDBRoomService:
    """MongoDB房間儲存服務"""
    
    def __init__(self):
        self.rooms_collection = mongodb.get_collection("rooms")
    
    def save_room(self, room: Room) -> bool:
        """保存房間到MongoDB"""
        try:
            # 轉換玩家數據
            players_data = []
            for player in room.players:
                players_data.append({
                    "player_id": player.player_id,
                    "player_name": player.player_name,
                    "status": player.status,
                    "joined_at": player.joined_at,
                    "last_seen": player.last_seen
                })
            
            # 建立房間文檔
            room_doc = RoomDocument(
                room_id=room.room_id,
                status=room.status,
                players=players_data,
                max_players=room.max_players,
                game_id=room.game_id,
                created_at=room.created_at,
                started_at=room.started_at,
                finished_at=room.finished_at,
                updated_at=datetime.now()
            )
            
            # 使用upsert來避免重複
            self.rooms_collection.replace_one(
                {"room_id": room.room_id},
                room_doc.dict(by_alias=True, exclude={"id"}),
                upsert=True
            )
            
            return True
            
        except Exception as e:
            print(f"保存房間失敗: {e}")
            return False
    
    def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        """從MongoDB獲取房間"""
        try:
            room_doc = self.rooms_collection.find_one({"room_id": room_id})
            if room_doc:
                # 移除MongoDB的_id欄位
                room_doc.pop("_id", None)
                return room_doc
            return None
            
        except Exception as e:
            print(f"獲取房間失敗: {e}")
            return None
    
    def get_rooms(self, status: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """獲取房間列表"""
        try:
            query = {}
            if status:
                query["status"] = status
            
            cursor = self.rooms_collection.find(query).sort("created_at", -1).limit(limit)
            rooms = []
            
            for room_doc in cursor:
                room_doc.pop("_id", None)
                rooms.append(room_doc)
            
            return rooms
            
        except Exception as e:
            print(f"獲取房間列表失敗: {e}")
            return []
    
    def get_rooms_by_status(self, status: str) -> List[Dict[str, Any]]:
        """根據狀態獲取房間"""
        try:
            cursor = self.rooms_collection.find({"status": status}).sort("created_at", -1)
            rooms = []
            
            for room_doc in cursor:
                room_doc.pop("_id", None)
                rooms.append(room_doc)
            
            return rooms
            
        except Exception as e:
            print(f"根據狀態獲取房間失敗: {e}")
            return []
    
    def find_player_room(self, player_id: str) -> Optional[Dict[str, Any]]:
        """尋找玩家所在的房間"""
        try:
            # 查找包含指定玩家ID的房間
            room_doc = self.rooms_collection.find_one({
                "players.player_id": player_id,
                "status": {"$in": ["waiting", "starting", "playing"]}  # 排除已結束或放棄的房間
            })
            
            if room_doc:
                room_doc.pop("_id", None)
                return room_doc
            
            return None
            
        except Exception as e:
            print(f"尋找玩家房間失敗: {e}")
            return None
    
    def delete_room(self, room_id: str) -> bool:
        """刪除房間"""
        try:
            result = self.rooms_collection.delete_one({"room_id": room_id})
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"刪除房間失敗: {e}")
            return False
    
    def update_room_status(self, room_id: str, status: str) -> bool:
        """更新房間狀態"""
        try:
            result = self.rooms_collection.update_one(
                {"room_id": room_id},
                {
                    "$set": {
                        "status": status,
                        "updated_at": datetime.now()
                    }
                }
            )
            return result.modified_count > 0
            
        except Exception as e:
            print(f"更新房間狀態失敗: {e}")
            return False
    
    def add_player_to_room(self, room_id: str, player_id: str, player_name: str) -> bool:
        """將玩家添加到房間"""
        try:
            player_data = {
                "player_id": player_id,
                "player_name": player_name,
                "status": "waiting",
                "joined_at": datetime.now(),
                "last_seen": datetime.now()
            }
            
            result = self.rooms_collection.update_one(
                {"room_id": room_id},
                {
                    "$push": {"players": player_data},
                    "$set": {"updated_at": datetime.now()}
                }
            )
            return result.modified_count > 0
            
        except Exception as e:
            print(f"添加玩家到房間失敗: {e}")
            return False
    
    def remove_player_from_room(self, room_id: str, player_id: str) -> bool:
        """從房間移除玩家"""
        try:
            result = self.rooms_collection.update_one(
                {"room_id": room_id},
                {
                    "$pull": {"players": {"player_id": player_id}},
                    "$set": {"updated_at": datetime.now()}
                }
            )
            return result.modified_count > 0
            
        except Exception as e:
            print(f"從房間移除玩家失敗: {e}")
            return False
    
    def update_player_status_in_room(self, room_id: str, player_id: str, status: str) -> bool:
        """更新房間中玩家的狀態"""
        try:
            result = self.rooms_collection.update_one(
                {"room_id": room_id, "players.player_id": player_id},
                {
                    "$set": {
                        "players.$.status": status,
                        "players.$.last_seen": datetime.now(),
                        "updated_at": datetime.now()
                    }
                }
            )
            return result.modified_count > 0
            
        except Exception as e:
            print(f"更新玩家狀態失敗: {e}")
            return False
    
    def get_waiting_rooms_count(self) -> int:
        """獲取等待中的房間數量"""
        try:
            return self.rooms_collection.count_documents({"status": "waiting"})
        except Exception as e:
            print(f"獲取等待房間數量失敗: {e}")
            return 0
    
    def get_active_rooms_count(self) -> int:
        """獲取活躍房間數量"""
        try:
            return self.rooms_collection.count_documents({
                "status": {"$in": ["waiting", "starting", "playing"]}
            })
        except Exception as e:
            print(f"獲取活躍房間數量失敗: {e}")
            return 0
    
    def cleanup_abandoned_rooms(self) -> int:
        """清理放棄的房間"""
        try:
            # 刪除狀態為 abandoned 且創建時間超過1小時的房間
            one_hour_ago = datetime.now() - timedelta(hours=1)
            
            result = self.rooms_collection.delete_many({
                "status": "abandoned",
                "created_at": {"$lt": one_hour_ago}
            })
            
            return result.deleted_count
            
        except Exception as e:
            print(f"清理放棄房間失敗: {e}")
            return 0