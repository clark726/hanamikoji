from enum import Enum

class CardStatus(Enum):
    """卡牌狀態"""
    IN_DECK = "IN_DECK"           # 在牌堆
    IN_HAND = "IN_HAND"           # 在手中
    ALLOCATED = "ALLOCATED"       # 已分配給藝妓
    SECRET = "SECRET"             # 被秘密保留
    DISCARDED = "DISCARDED"       # 被棄置
    REMOVED = "REMOVED"

class AllocationMethod(Enum):
    """分配方式"""
    GIFT = "GIFT"                # 獻禮
    COMPETE = "COMPETE"          # 競爭
    DIRECT = "DIRECT"            # 直接獲得