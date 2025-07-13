"""房間實體模型"""

from datetime import datetime
from typing import List, Optional, Dict
import uuid
from dataclasses import dataclass, field


@dataclass
class RoomPlayer:
    """房間中的玩家"""
    player_id: str
    player_name: str
    status: str = "waiting"  # waiting, ready, playing, disconnected
    joined_at: datetime = field(default_factory=datetime.now)
    last_seen: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict:
        """轉換為字典格式"""
        return {
            "player_id": self.player_id,
            "player_name": self.player_name,
            "status": self.status,
            "joined_at": self.joined_at.isoformat(),
            "last_seen": self.last_seen.isoformat()
        }


@dataclass
class Room:
    """房間實體"""
    room_id: str = field(default_factory=lambda: f"room_{uuid.uuid4().hex[:8]}")
    status: str = "waiting"  # waiting, starting, playing, finished, abandoned
    players: List[RoomPlayer] = field(default_factory=list)
    max_players: int = 2
    game_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    
    def add_player(self, player_id: str, player_name: str) -> bool:
        """添加玩家到房間"""
        if len(self.players) >= self.max_players:
            return False
            
        # 檢查玩家是否已在房間中
        if any(p.player_id == player_id for p in self.players):
            return False
            
        player = RoomPlayer(player_id=player_id, player_name=player_name)
        self.players.append(player)
        
        # 如果房間滿了，準備開始遊戲
        if len(self.players) == self.max_players:
            self.status = "starting"
            
        return True
    
    def remove_player(self, player_id: str) -> bool:
        """從房間移除玩家"""
        for i, player in enumerate(self.players):
            if player.player_id == player_id:
                self.players.pop(i)
                
                # 如果房間空了，標記為放棄
                if len(self.players) == 0:
                    self.status = "abandoned"
                elif self.status == "starting" and len(self.players) < self.max_players:
                    self.status = "waiting"
                    
                return True
        return False
    
    def get_player(self, player_id: str) -> Optional[RoomPlayer]:
        """獲取指定玩家"""
        for player in self.players:
            if player.player_id == player_id:
                return player
        return None
    
    def update_player_status(self, player_id: str, status: str) -> bool:
        """更新玩家狀態"""
        player = self.get_player(player_id)
        if player:
            player.status = status
            player.last_seen = datetime.now()
            return True
        return False
    
    def is_full(self) -> bool:
        """檢查房間是否已滿"""
        return len(self.players) >= self.max_players
    
    def can_start_game(self) -> bool:
        """檢查是否可以開始遊戲"""
        return (
            len(self.players) == self.max_players and
            self.status == "starting" and
            all(p.status in ["ready", "waiting"] for p in self.players)
        )
    
    def start_game(self, game_id: str) -> None:
        """開始遊戲"""
        if self.can_start_game():
            self.game_id = game_id
            self.status = "playing"
            self.started_at = datetime.now()
            
            # 更新所有玩家狀態為遊戲中
            for player in self.players:
                player.status = "playing"
    
    def finish_game(self) -> None:
        """結束遊戲"""
        self.status = "finished"
        self.finished_at = datetime.now()
    
    def to_dict(self) -> Dict:
        """轉換為字典格式"""
        return {
            "room_id": self.room_id,
            "status": self.status,
            "players": [p.to_dict() for p in self.players],
            "max_players": self.max_players,
            "game_id": self.game_id,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Room':
        """從字典創建房間實例"""
        room = cls(
            room_id=data["room_id"],
            status=data["status"],
            max_players=data.get("max_players", 2),
            game_id=data.get("game_id"),
            created_at=datetime.fromisoformat(data["created_at"]) if data["created_at"] else datetime.now(),
            started_at=datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None,
            finished_at=datetime.fromisoformat(data["finished_at"]) if data.get("finished_at") else None
        )
        
        # 添加玩家
        for player_data in data.get("players", []):
            player = RoomPlayer(
                player_id=player_data["player_id"],
                player_name=player_data["player_name"],
                status=player_data.get("status", "waiting"),
                joined_at=datetime.fromisoformat(player_data["joined_at"]) if player_data.get("joined_at") else datetime.now(),
                last_seen=datetime.fromisoformat(player_data["last_seen"]) if player_data.get("last_seen") else datetime.now()
            )
            room.players.append(player)
        
        return room