"""卡牌相關領域實體"""
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

# 只在類型檢查時導入，避免運行時循環導入
if TYPE_CHECKING:
    from .user import Player

from ..enums.card_enums import CardStatus
from ..enums.game_enums import ActionType


class Geisha:
    """藝妓領域實體"""

    def __init__(self, geisha_id: str, name: str, charm: int,
                 description: str, gift_item: str, gift_count: int):
        self.id = geisha_id
        self.name = name
        self.charm = charm
        self.description = description
        self.gift_item = gift_item
        self.favored_player: Optional['Player'] = None

    def set_favor(self, player: Optional['Player']) -> None:
        """設定青睞的玩家"""
        self.favored_player = player

    def calculate_influence(self, player: 'Player', all_cards: List['GiftCard']) -> int:
        """計算玩家對此藝妓的影響力"""
        return len([
            card for card in all_cards
            if (card.geisha_id == self.id and
                card.owner_name == player.name and
                card.status == CardStatus.ALLOCATED)
        ])

    def determine_favor(self, players: List['Player'], all_cards: List['GiftCard']) -> None:
        """決定青睞歸屬"""
        influence_counts = {}

        # 計算每個玩家的影響力
        for player in players:
            count = self.calculate_influence(player, all_cards)
            if count > 0:
                influence_counts[player] = count

        if not influence_counts:
            self.favored_player = None
            return

        # 找出最高影響力
        max_count = max(influence_counts.values())
        players_with_max = [p for p, count in influence_counts.items() if count == max_count]

        # 如果有平手，則無人獲得青睞
        self.favored_player = players_with_max[0] if len(players_with_max) == 1 else None

    def is_neutral(self) -> bool:
        """是否中立"""
        return self.favored_player is None

    def get_influence_value(self) -> int:
        """獲取影響力值"""
        return self.charm

    def __repr__(self):
        return f"Geisha(name='{self.name}', charm={self.charm})"


class GiftCard:
    """禮物卡領域實體"""

    def __init__(self, geisha_id: str, item_name: str, charm_value: int):
        self.geisha_id = geisha_id
        self.item_name = item_name
        self.charm_value = charm_value
        self.status = CardStatus.IN_DECK
        self.owner_name: Optional[str] = None
        self.original_owner_name: Optional[str] = None
        self.allocated_by_action: Optional[ActionType] = None
        self.allocation_time: Optional[datetime] = None
        self.created_time = datetime.now()

    def allocate_to_player(self, player: 'Player', action_type: ActionType) -> None:
        """將卡片分配給玩家"""
        self.owner_name = player.name
        self.allocated_by_action = action_type
        self.allocation_time = datetime.now()

        if action_type == ActionType.SECRET:
            self.status = CardStatus.SECRET
        else:
            self.status = CardStatus.ALLOCATED

    def mark_as_secret(self, player: 'Player') -> None:
        """標記為秘密保留"""
        self.allocate_to_player(player, ActionType.SECRET)

    def discard(self) -> None:
        """棄置卡片"""
        self.status = CardStatus.DISCARDED
        self.allocation_time = datetime.now()

    def is_owned_by(self, player: 'Player') -> bool:
        """檢查是否被特定玩家持有"""
        return self.owner_name == player.name

    def is_in_hand(self) -> bool:
        """檢查是否在手牌中"""
        return self.status == CardStatus.IN_HAND

    def is_allocated(self) -> bool:
        """檢查是否已分配"""
        return self.status in [CardStatus.ALLOCATED, CardStatus.SECRET]

    def is_secret(self) -> bool:
        """檢查是否為秘密卡"""
        return self.status == CardStatus.SECRET

    def is_discarded(self) -> bool:
        """檢查是否已棄置"""
        return self.status == CardStatus.DISCARDED

    def get_status_description(self) -> str:
        """獲取狀態描述"""
        status_descriptions = {
            CardStatus.IN_DECK: "在牌庫中",
            CardStatus.IN_HAND: "在手牌中",
            CardStatus.ALLOCATED: "已分配",
            CardStatus.SECRET: "秘密保留",
            CardStatus.DISCARDED: "已棄置",
            CardStatus.REMOVED: "已移除"
        }
        return status_descriptions.get(self.status, "未知狀態")

    def clone(self) -> 'GiftCard':
        """克隆卡片"""
        new_card = GiftCard(self.geisha_id, self.item_name, self.charm_value)
        new_card.id = str(uuid.uuid4())  # 新的ID
        return new_card

    def __repr__(self):
        return f"GiftCard(item='{self.item_name}', charm={self.charm_value}, status={self.status.value})"