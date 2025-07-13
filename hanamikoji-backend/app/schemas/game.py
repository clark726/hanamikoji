"""遊戲相關的Pydantic模型"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class GameStatus(str, Enum):
    """遊戲狀態"""
    WAITING = "WAITING"
    PLAYING = "PLAYING" 
    FINISHED = "FINISHED"


class ActionType(str, Enum):
    """行動類型"""
    SECRET = "SECRET"      # 秘密保留
    DISCARD = "DISCARD"    # 棄牌
    GIFT = "GIFT"          # 獻禮
    COMPETE = "COMPETE"    # 競爭


class FavorStatus(str, Enum):
    """青睞狀態"""
    NEUTRAL = "NEUTRAL"
    PLAYER1 = "PLAYER1"
    PLAYER2 = "PLAYER2"


class GiftCard(BaseModel):
    """禮物卡模型"""
    id: str
    geisha_id: str
    item_name: str
    charm_value: int
    status: str = "IN_HAND"
    owner_id: Optional[str] = None


class Geisha(BaseModel):
    """藝妓模型"""
    id: str
    name: str
    charm: int
    gift_item: str
    description: Optional[str] = None
    favor: FavorStatus = FavorStatus.NEUTRAL
    allocated_gifts: Dict[str, List[GiftCard]] = Field(default_factory=dict)


class Player(BaseModel):
    """玩家模型"""
    id: str
    name: str
    hand_cards: List[GiftCard] = Field(default_factory=list)
    used_actions: List[ActionType] = Field(default_factory=list)
    secret_cards: List[GiftCard] = Field(default_factory=list)
    allocated_gifts: Dict[str, List[GiftCard]] = Field(default_factory=dict)
    score: int = 0
    is_current_player: bool = False


class GameCreateRequest(BaseModel):
    """創建遊戲請求"""
    player1_name: str = Field(..., min_length=1, max_length=50)
    player2_name: str = Field(..., min_length=1, max_length=50)


class ActionRequest(BaseModel):
    """遊戲動作請求"""
    player_id: str
    action_type: ActionType
    card_ids: List[str]
    target_geisha_id: Optional[str] = None
    groupings: Optional[List[List[str]]] = None


class GameMessage(BaseModel):
    """遊戲訊息"""
    id: str
    type: str
    text: str
    timestamp: int
    player_id: Optional[str] = None
    player_name: Optional[str] = None
    action_type: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class GameStateResponse(BaseModel):
    """遊戲狀態回應"""
    game_id: str
    status: GameStatus
    current_player_id: str
    round_number: int
    players: Dict[str, Player]
    geishas: List[Geisha]
    messages: List[GameMessage] = Field(default_factory=list)
    winner: Optional[str] = None


class GameStatusResponse(BaseModel):
    """遊戲狀態簡要回應"""
    game_id: str
    status: GameStatus
    current_player_id: str
    round_number: int
    player_names: List[str]
    created_at: str
    winner: Optional[str] = None


class GameListItem(BaseModel):
    """遊戲列表項目"""
    game_id: str
    status: GameStatus
    player_names: List[str]
    created_at: str
    current_round: int