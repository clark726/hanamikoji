"""房間相關的Pydantic模型"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class RoomStatus(str, Enum):
    """房間狀態"""
    WAITING = "waiting"
    STARTING = "starting"
    PLAYING = "playing"
    FINISHED = "finished"
    ABANDONED = "abandoned"


class PlayerStatus(str, Enum):
    """玩家狀態"""
    WAITING = "waiting"
    READY = "ready"
    PLAYING = "playing"
    DISCONNECTED = "disconnected"


class RoomPlayer(BaseModel):
    """房間玩家模型"""
    player_id: str
    player_name: str
    status: PlayerStatus = PlayerStatus.WAITING
    joined_at: str
    last_seen: str


class JoinRoomRequest(BaseModel):
    """加入房間請求"""
    player_name: str = Field(..., min_length=1, max_length=50)
    player_id: Optional[str] = None


class LeaveRoomRequest(BaseModel):
    """離開房間請求"""
    player_id: str
    reason: Optional[str] = None


class RoomResponse(BaseModel):
    """房間回應"""
    room_id: str
    status: RoomStatus
    players: List[RoomPlayer]
    max_players: int = 2
    game_id: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    current_turn: Optional[str] = None
    message: Optional[str] = None


class RoomListItem(BaseModel):
    """房間列表項目"""
    room_id: str
    status: RoomStatus
    player_count: int
    max_players: int = 2
    game_id: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None


class RoomListResponse(BaseModel):
    """房間列表回應"""
    rooms: List[RoomListItem]
    total: int
    page: int = 1
    limit: int = 20


class LeaveRoomResponse(BaseModel):
    """離開房間回應"""
    message: str
    room_id: str
    remaining_players: int
    reason: Optional[str] = None


class ErrorResponse(BaseModel):
    """錯誤回應"""
    error: str
    message: str
    details: Optional[dict] = None
    available_rooms: Optional[List[str]] = None
    current_room: Optional[str] = None