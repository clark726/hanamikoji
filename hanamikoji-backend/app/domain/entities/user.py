from datetime import datetime
from typing import List, Optional

from app.domain.entities.card import GiftCard
from app.domain.enums.game_enums import ActionType

class ActionMarker:
    """行動標記"""

    def __init__(self, action_type: ActionType):
        self.action_type = action_type
        self.is_used = False
        self.used_time: Optional[datetime] = None
        self.player_id: Optional[str] = None

def _initialize_action_markers() -> List['ActionMarker']:
    """初始化行動標記"""
    return [ActionMarker(action_type) for action_type in ActionType]


class Player:
    """玩家領域實體"""

    def __init__(self, player_id: str, name: str):
        self.id = player_id
        self.name = name
        self.hand_cards: List['GiftCard'] = []
        self.used_actions: List[ActionMarker] = _initialize_action_markers()
        self.allocated_cards: List['GiftCard'] = []
        self.secret_cards: List['GiftCard'] = []
        self.score = 0
        self.is_active = True
        self.join_time = datetime.now()

    def add_card(self, card):
        self.hand_cards.append(card)


