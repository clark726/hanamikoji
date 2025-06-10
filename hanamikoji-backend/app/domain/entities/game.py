"""遊戲相關領域實體"""

from datetime import datetime
from typing import List

from .card import Geisha, GiftCard
from .user import Player
from ..enums.game_enums import GameStatus, ActionType


class Game:
    """遊戲領域實體"""

    def __init__(self, game_id: str, player1: 'Player', player2: 'Player'):
        self.game_id = game_id
        self.player1 = player1
        self.player2 = player2
        self.status = GameStatus.INITIALIZING
        self.current_player = player1
        self.round_number = 1
        self.created_at = datetime.now()

        self.geishas: List['Geisha'] = []
        self.all_cards: List['GiftCard'] = []



