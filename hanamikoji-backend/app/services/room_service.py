"""房間管理服務"""

from typing import List, Optional, Dict
import uuid
from datetime import datetime

from app.domain.entities.room import Room, RoomPlayer
from app.services.mongodb_room_service import MongoDBRoomService
from app.services.game_service import GameService


class RoomService:
    """房間管理業務邏輯服務"""
    
    def __init__(self, db=None):
        self.mongo_service = MongoDBRoomService()
        self._active_rooms: Dict[str, Room] = {}
        self.db = db
    
    def find_available_room(self) -> Optional[Room]:
        """尋找可用的房間"""
        # 首先檢查內存中的活躍房間
        for room in self._active_rooms.values():
            if room.status == "waiting" and not room.is_full():
                print(f"✅ 在內存中找到可用房間: {room.room_id}")
                return room
        
        # 從MongoDB載入等待中的房間作為備選
        try:
            waiting_rooms = self.mongo_service.get_rooms_by_status("waiting")
            print(f"🔍 查找可用房間，找到 {len(waiting_rooms)} 個等待中的房間")
            
            for room_data in waiting_rooms:
                room = Room.from_dict(room_data)
                print(f"📋 檢查房間 {room.room_id}: 玩家數 {len(room.players)}/{room.max_players}, 狀態 {room.status}")
                if not room.is_full():
                    print(f"✅ 從MongoDB找到可用房間: {room.room_id}")
                    # 加載到內存緩存
                    self._active_rooms[room.room_id] = room
                    return room
        except Exception as e:
            print(f"⚠️ MongoDB查詢失敗，使用內存存儲: {e}")
        
        print("❌ 沒有找到可用房間，將創建新房間")
        return None
    
    def create_room(self) -> Room:
        """創建新房間"""
        room = Room()
        # 保存到資料庫
        self.mongo_service.save_room(room)
        # 保存到內存緩存
        self._active_rooms[room.room_id] = room
        return room
    
    def join_room(self, player_name: str, player_id: Optional[str] = None) -> Dict:
        """加入房間 - 自動分配邏輯"""
        # 生成玩家ID（如果沒有提供）
        if not player_id:
            player_id = f"player_{uuid.uuid4().hex[:8]}"
        
        # 檢查玩家是否已在其他房間
        existing_room = self.find_player_room(player_id)
        if existing_room:
            return {
                "error": "PlayerAlreadyInRoom",
                "message": "玩家已在其他房間中",
                "current_room": existing_room.room_id
            }
        
        # 尋找可用房間
        room = self.find_available_room()
        
        # 沒有可用房間則創建新房間
        if not room:
            room = self.create_room()
        
        # 加入房間
        success = room.add_player(player_id, player_name)
        
        if not success:
            return {
                "error": "RoomFull",
                "message": "房間已滿",
                "available_rooms": [r.room_id for r in self.get_waiting_rooms()]
            }
        
        # 更新房間狀態
        self.mongo_service.save_room(room)
        self._active_rooms[room.room_id] = room
        
        # 準備回應
        response = room.to_dict()
        
        # 如果房間滿了，準備開始遊戲
        if room.status == "starting":
            # 自動創建遊戲
            game_result = self._create_game_for_room(room)
            if game_result.get("success"):
                game_id = game_result["game_id"]
                room.game_id = game_id
                room.status = "playing"
                room.started_at = datetime.now()
                
                # 更新房間狀態
                self.mongo_service.save_room(room)
                self._active_rooms[room.room_id] = room
                
                response = room.to_dict()
                response["message"] = "遊戲已開始"
                response["game_id"] = game_id
            else:
                response["message"] = "遊戲創建失敗，請稍後重試"
            
        return response
    
    def get_room(self, room_id: str) -> Optional[Room]:
        """獲取房間"""
        # 先從內存緩存查找
        if room_id in self._active_rooms:
            return self._active_rooms[room_id]
        
        # 從資料庫載入
        room_data = self.mongo_service.get_room(room_id)
        if room_data:
            room = Room.from_dict(room_data)
            self._active_rooms[room_id] = room
            return room
        
        return None
    
    def leave_room(self, room_id: str, player_id: str, reason: Optional[str] = None) -> Dict:
        """離開房間"""
        room = self.get_room(room_id)
        
        if not room:
            return {
                "error": "RoomNotFound",
                "message": "房間不存在"
            }
        
        # 檢查是否可以離開房間（遊戲進行中不允許離開）
        if room.status == "playing":
            return {
                "error": "InvalidOperation",
                "message": "遊戲進行中無法離開房間"
            }
        
        # 移除玩家
        success = room.remove_player(player_id)
        
        if not success:
            return {
                "error": "PlayerNotInRoom",
                "message": "玩家不在此房間中"
            }
        
        # 更新房間狀態
        self.mongo_service.save_room(room)
        
        # 如果房間空了，從緩存中移除
        if room.status == "abandoned":
            if room_id in self._active_rooms:
                del self._active_rooms[room_id]
            
            return {
                "message": "房間已解散",
                "room_id": room_id,
                "reason": "所有玩家已離開"
            }
        
        return {
            "message": "成功離開房間",
            "room_id": room_id,
            "remaining_players": len(room.players)
        }
    
    def get_room_list(self, status: Optional[str] = None, limit: int = 20) -> Dict:
        """獲取房間列表"""
        rooms_data = self.mongo_service.get_rooms(status=status, limit=limit)
        
        room_items = []
        for room_data in rooms_data:
            room_items.append({
                "room_id": room_data["room_id"],
                "status": room_data["status"],
                "player_count": len(room_data.get("players", [])),
                "max_players": room_data.get("max_players", 2),
                "game_id": room_data.get("game_id"),
                "created_at": room_data["created_at"],
                "started_at": room_data.get("started_at")
            })
        
        return {
            "rooms": room_items,
            "total": len(room_items),
            "page": 1,
            "limit": limit
        }
    
    def find_player_room(self, player_id: str) -> Optional[Room]:
        """尋找玩家所在的房間"""
        # 先從內存緩存查找
        for room in self._active_rooms.values():
            if any(p.player_id == player_id for p in room.players):
                return room
        
        # 從資料庫查找
        room_data = self.mongo_service.find_player_room(player_id)
        if room_data:
            room = Room.from_dict(room_data)
            self._active_rooms[room.room_id] = room
            return room
        
        return None
    
    def get_waiting_rooms(self) -> List[Room]:
        """獲取等待中的房間"""
        waiting_rooms_data = self.mongo_service.get_rooms_by_status("waiting")
        rooms = []
        
        for room_data in waiting_rooms_data:
            room = Room.from_dict(room_data)
            rooms.append(room)
        
        return rooms
    
    def start_game_in_room(self, room_id: str, game_id: str) -> bool:
        """在房間中開始遊戲"""
        room = self.get_room(room_id)
        
        if not room or not room.can_start_game():
            return False
        
        room.start_game(game_id)
        self.mongo_service.save_room(room)
        
        return True
    
    def finish_game_in_room(self, room_id: str) -> bool:
        """結束房間中的遊戲"""
        room = self.get_room(room_id)
        
        if not room:
            return False
        
        room.finish_game()
        self.mongo_service.save_room(room)
        
        # 從緩存中移除已結束的房間
        if room_id in self._active_rooms:
            del self._active_rooms[room_id]
        
        return True
    
    def _create_game_for_room(self, room: Room) -> Dict:
        """為房間創建遊戲"""
        if len(room.players) != 2:
            return {
                "success": False,
                "error": "房間玩家數量不足"
            }
        
        try:
            # 獲取玩家信息
            player1 = room.players[0]
            player2 = room.players[1]
            
            # 使用遊戲服務創建遊戲
            game_service = GameService(self.db)
            game_data = game_service.create_game(
                player1.player_name, 
                player2.player_name
            )
            
            # 提取 game_id
            game_id = game_data.get("game_id")
            
            if not game_id:
                return {
                    "success": False,
                    "error": "遊戲創建失敗，無法獲取遊戲ID"
                }
            
            return {
                "success": True,
                "game_id": game_id,
                "game_data": game_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"遊戲創建失敗: {str(e)}"
            }