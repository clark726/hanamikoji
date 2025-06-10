"""卡牌相關枚舉"""

from enum import Enum

class GameStatus(Enum):
    """遊戲狀態：初始化、進行中、結束"""
    INITIALIZING = 0    # 初始化
    IN_PROGRESS = 1     # 進行中
    FINISHED = 2        # 結束

class ActionType(Enum):
    """行動類型：秘密保留、棄牌、獻禮、競爭"""
    SECRET = 0      # 秘密保留
    DISCARD = 1     # 棄牌
    GIFT = 2        # 獻禮
    COMPETE = 3     # 競爭
