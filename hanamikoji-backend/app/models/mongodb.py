"""MongoDB文檔模型"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    """自定義ObjectId類型"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema


class MongoBaseModel(BaseModel):
    """MongoDB基礎模型"""
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class GiftCardDocument(MongoBaseModel):
    """禮物卡文檔"""
    card_id: str
    geisha_id: str
    item_name: str
    charm_value: int
    status: str = "IN_DECK"  # IN_DECK, IN_HAND, ALLOCATED, SECRET, DISCARDED
    owner_id: Optional[str] = None
    game_id: str
    created_at: datetime = Field(default_factory=datetime.now)


class GeishaDocument(MongoBaseModel):
    """藝妓文檔"""
    geisha_id: str
    name: str
    charm: int
    gift_item: str
    description: Optional[str] = None
    favor: str = "NEUTRAL"  # NEUTRAL, PLAYER1, PLAYER2
    allocated_gifts: Dict[str, List[str]] = Field(default_factory=dict)  # player_id -> card_ids
    game_id: str
    created_at: datetime = Field(default_factory=datetime.now)


class PlayerDocument(MongoBaseModel):
    """玩家文檔"""
    player_id: str
    name: str
    game_id: str
    hand_card_ids: List[str] = Field(default_factory=list)
    used_actions: List[str] = Field(default_factory=list)
    secret_card_ids: List[str] = Field(default_factory=list)
    allocated_gift_ids: Dict[str, List[str]] = Field(default_factory=dict)  # geisha_id -> card_ids
    score: int = 0
    is_current_player: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class GameMessageDocument(MongoBaseModel):
    """遊戲訊息文檔"""
    message_id: str
    game_id: str
    type: str
    text: str
    timestamp: int
    player_id: Optional[str] = None
    player_name: Optional[str] = None
    action_type: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)


class GameDocument(MongoBaseModel):
    """遊戲文檔"""
    game_id: str
    status: str = "WAITING"  # WAITING, PLAYING, FINISHED
    current_player_id: str
    round_number: int = 1
    player_ids: List[str] = Field(default_factory=list)
    geisha_ids: List[str] = Field(default_factory=list)
    all_card_ids: List[str] = Field(default_factory=list)
    winner: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    finished_at: Optional[datetime] = None


class GameActionDocument(MongoBaseModel):
    """遊戲動作紀錄文檔"""
    action_id: str
    game_id: str
    player_id: str
    action_type: str  # SECRET, DISCARD, GIFT, COMPETE
    card_ids: List[str]
    target_geisha_id: Optional[str] = None
    groupings: Optional[List[List[str]]] = None
    result: Dict[str, Any] = Field(default_factory=dict)
    round_number: int
    action_sequence: int  # 該回合的第幾個動作
    created_at: datetime = Field(default_factory=datetime.now)


class GameStateSnapshot(MongoBaseModel):
    """遊戲狀態快照"""
    snapshot_id: str
    game_id: str
    round_number: int
    current_player_id: str
    game_state: Dict[str, Any]  # 完整遊戲狀態的JSON
    created_at: datetime = Field(default_factory=datetime.now)
    snapshot_type: str = "auto"  # auto, manual, round_end, game_end


class RoomPlayerDocument(MongoBaseModel):
    """房間玩家文檔"""
    player_id: str
    player_name: str
    status: str = "waiting"  # waiting, ready, playing, disconnected
    joined_at: datetime = Field(default_factory=datetime.now)
    last_seen: datetime = Field(default_factory=datetime.now)


class RoomDocument(MongoBaseModel):
    """房間文檔"""
    room_id: str
    status: str = "waiting"  # waiting, starting, playing, finished, abandoned
    players: List[Dict[str, Any]] = Field(default_factory=list)  # RoomPlayer documents
    max_players: int = 2
    game_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.now)


# 索引定義
MONGODB_INDEXES = {
    "games": [
        {"keys": [("game_id", 1)], "unique": True},
        {"keys": [("status", 1)]},
        {"keys": [("created_at", -1)]},
        {"keys": [("player_ids", 1)]},
    ],
    "players": [
        {"keys": [("player_id", 1), ("game_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("name", 1)]},
    ],
    "cards": [
        {"keys": [("card_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("geisha_id", 1)]},
        {"keys": [("status", 1)]},
        {"keys": [("owner_id", 1)]},
    ],
    "geishas": [
        {"keys": [("geisha_id", 1), ("game_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("favor", 1)]},
    ],
    "game_actions": [
        {"keys": [("action_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("player_id", 1)]},
        {"keys": [("round_number", 1)]},
        {"keys": [("created_at", -1)]},
        {"keys": [("game_id", 1), ("round_number", 1), ("action_sequence", 1)]},
    ],
    "game_messages": [
        {"keys": [("message_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("timestamp", -1)]},
    ],
    "game_snapshots": [
        {"keys": [("snapshot_id", 1)], "unique": True},
        {"keys": [("game_id", 1)]},
        {"keys": [("round_number", 1)]},
        {"keys": [("created_at", -1)]},
    ],
    "rooms": [
        {"keys": [("room_id", 1)], "unique": True},
        {"keys": [("status", 1)]},
        {"keys": [("created_at", -1)]},
        {"keys": [("players.player_id", 1)]},
        {"keys": [("game_id", 1)]},
    ]
}