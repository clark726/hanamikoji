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

class CardStatus(Enum):
    """卡牌狀態"""
    IN_DECK = "IN_DECK"           # 在牌堆
    IN_HAND = "IN_HAND"           # 在手中
    ALLOCATED = "ALLOCATED"       # 已分配給藝妓
    SECRET = "SECRET"             # 被秘密保留
    DISCARDED = "DISCARDED"       # 被棄置

class AllocationMethod(Enum):
    """分配方式"""
    GIFT = "GIFT"                # 獻禮
    COMPETE = "COMPETE"          # 競爭
    DIRECT = "DIRECT"            # 直接獲得