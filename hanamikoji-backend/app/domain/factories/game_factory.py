# domain/factories/game_factory.py
"""遊戲工廠 - 負責從JSON創建遊戲實例"""

import json
import random
import uuid
from pathlib import Path
from typing import List, Dict

from ..entities.card import Geisha, GiftCard
from ..entities.game import Game
from ..entities.user import Player
from ..enums.card_enums import CardStatus


class GameDataLoader:
    """遊戲資料載入器"""

    def __init__(self, data_dir: str = "app/domain/data"):
        self.data_dir = Path(data_dir)
        self._geisha_templates = None
        self._card_templates = None

        # 確保目錄存在
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def load_geisha_templates(self) -> List[Dict]:
        """載入藝妓模板"""
        if self._geisha_templates is None:
            geisha_file = self.data_dir / "geishas.json"
            if not geisha_file.exists():
                raise FileNotFoundError(f"找不到藝妓資料檔案：{geisha_file}")

            with open(geisha_file, 'r', encoding='utf-8') as f:
                self._geisha_templates = json.load(f)
        return self._geisha_templates

    def load_card_templates(self) -> List[Dict]:
        """載入卡牌模板"""
        if self._card_templates is None:
            card_file = self.data_dir / "card.json"
            if not card_file.exists():
                raise FileNotFoundError(f"找不到卡牌資料檔案：{card_file}")

            with open(card_file, 'r', encoding='utf-8') as f:
                self._card_templates = json.load(f)
        return self._card_templates


class GeishaFactory:
    """藝妓工廠"""

    def __init__(self, data_loader: GameDataLoader):
        self.data_loader = data_loader

    def create_all_geishas(self) -> List[Geisha]:
        """創建所有藝妓實例"""
        templates = self.data_loader.load_geisha_templates()
        return [self._create_geisha_from_template(template) for template in templates]

    def _create_geisha_from_template(self, template: Dict) -> Geisha:
        """從模板創建藝妓"""
        return Geisha(
            geisha_id=template["id"],
            name=template["name"],
            charm=template["charm_value"],
            description=f"專精於{template['gift_item']}的優雅藝妓",
            gift_item=template["gift_item"],
            gift_count=template["gift_count"],
        )


class CardFactory:
    """卡牌工廠"""

    def __init__(self, data_loader: GameDataLoader):
        self.data_loader = data_loader

    def create_shuffled_deck(self) -> List[GiftCard]:
        """創建洗好的牌組"""
        cards = self._create_all_gift_cards()
        random.shuffle(cards)
        return cards

    def _create_all_gift_cards(self) -> List[GiftCard]:
        """創建所有禮物卡實例"""
        card_templates = self.data_loader.load_card_templates()
        all_cards = []

        for template in card_templates:
            cards = self._create_cards_from_template(template)
            all_cards.extend(cards)
        return all_cards

    def _create_cards_from_template(self, card_template: Dict) -> List[GiftCard]:
        """從模板創建卡牌"""
        return [
            GiftCard(
                geisha_id=card_template["geisha_id"],
                item_name=card_template["name"],
                charm_value=card_template["charm_value"],
            )
            for _ in range(card_template["count"])
        ]


class GameFactory:
    """遊戲工廠"""

    def __init__(self, data_dir: str = "app/domain/data"):
        data_loader = GameDataLoader(data_dir)
        self.geisha_factory = GeishaFactory(data_loader)
        self.card_factory = CardFactory(data_loader)

    def create_new_game(self, player1_name: str, player2_name: str) -> Game:
        """創建新遊戲"""
        # 1. 創建基本遊戲實例
        game = self._create_game_instance(player1_name, player2_name)

        # 2. 設置遊戲內容
        game.geishas = self.geisha_factory.create_all_geishas()
        game.all_cards = self.card_factory.create_shuffled_deck()

        # 3. 分發初始手牌
        self._deal_initial_cards(game)

        return game

    def _create_game_instance(self, player1_name: str, player2_name: str) -> Game:
        """創建遊戲實例"""
        game_id = str(uuid.uuid4())
        player1 = Player(str(uuid.uuid4()), player1_name)
        player2 = Player(str(uuid.uuid4()), player2_name)
        return Game(game_id, player1, player2)

    def _deal_initial_cards(self, game: Game) -> None:
        """分發初始手牌"""
        cards = game.all_cards

        # 移除一張卡（遊戲規則）
        if cards:
            removed_card = cards.pop()
            removed_card.status = CardStatus.REMOVED

        # 分發手牌（每人6張）
        for i, card in enumerate(cards[:12]):
            card.status = CardStatus.IN_HAND
            if i < 6:
                game.player1.hand_cards.append(card)
                card.owner_name = game.player1.name
            else:
                game.player2.hand_cards.append(card)
                card.owner_name = game.player2.name

        # 剩餘卡牌留在牌庫
        for card in cards[12:]:
            card.status = CardStatus.IN_DECK


class GameInitializationService:
    """遊戲初始化服務"""

    def __init__(self, data_dir: str = "app/domain/data"):
        self.game_factory = GameFactory(data_dir)

    def initialize_new_game(self, player1_name: str, player2_name: str) -> Dict:
        """初始化新遊戲並返回完整狀態"""
        game = self.game_factory.create_new_game(player1_name, player2_name)
        return self._create_game_state_response(game)

    def _create_game_state_response(self, game: Game) -> Dict:
        """創建遊戲狀態回應"""
        return {
            "game_id": game.game_id,
            "status": "PLAYING",  # 使用字串而非枚舉值
            "current_player_id": game.current_player.id,
            "round_number": game.round_number,
            "players": {
                game.player1.id: self._player_to_dict(game.player1, game.current_player),
                game.player2.id: self._player_to_dict(game.player2, game.current_player)
            },
            "geishas": [self._geisha_to_dict(geisha) for geisha in game.geishas],
            "messages": [],
            "winner": None
        }

    def _player_to_dict(self, player: Player, current_player: Player) -> Dict:
        """將玩家轉換為字典"""
        return {
            "id": player.id,
            "name": player.name,
            "hand_cards": [self._card_to_dict(card) for card in player.hand_cards],
            "used_actions": [],
            "secret_cards": [],
            "allocated_gifts": {},
            "score": 0,
            "is_current_player": player.id == current_player.id
        }

    def _card_to_dict(self, card: GiftCard) -> Dict:
        """將卡牌轉換為字典"""
        return {
            "id": f"{card.geisha_id}_{card.item_name}_{id(card)}",  # 生成唯一ID
            "geisha_id": card.geisha_id,
            "item_name": card.item_name,
            "charm_value": card.charm_value,
            "status": card.status.value,
            "owner_id": None
        }

    def _geisha_to_dict(self, geisha: Geisha) -> Dict:
        """將藝妓轉換為字典"""
        return {
            "id": geisha.id,
            "name": geisha.name,
            "charm": geisha.charm,
            "gift_item": geisha.gift_item,
            "description": geisha.description,
            "favor": "NEUTRAL",
            "allocated_gifts": {}
        }

    def validate_game_data(self) -> Dict:
        """驗證遊戲資料完整性"""
        try:
            geishas = self.game_factory.geisha_factory.create_all_geishas()
            cards = self.game_factory.card_factory._create_all_gift_cards()

            # 驗證卡牌分配 (2,2,2,3,3,4,5)
            card_distribution = {}
            for card in cards:
                geisha_id = card.geisha_id
                card_distribution[geisha_id] = card_distribution.get(geisha_id, 0) + 1

            expected_counts = [2, 2, 2, 3, 3, 4, 5]
            actual_counts = sorted(card_distribution.values())

            return {
                "geisha_valid": len(geishas) == 7,
                "cards_valid": len(cards) == 21,
                "distribution_valid": actual_counts == expected_counts,
                "total_charm": sum(g.charm for g in geishas),
                "card_distribution": card_distribution
            }

        except Exception as e:
            return {
                "error": str(e),
                "valid": False
            }