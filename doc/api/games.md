# 遊戲管理 API

遊戲管理系統負責處理花見小路桌遊的核心邏輯，包括遊戲創建、狀態管理和動作執行。

## 📋 API 端點

### 1. 創建遊戲
創建新的花見小路遊戲實例

**端點**: `POST /api/v1/games/create`

**請求體**:
```json
{
  "player1_name": "玩家1",
  "player2_name": "玩家2"
}
```

**成功回應** (200):
```json
{
  "game_id": "46d2c26b-146a-431e-be42-efc3bbc683d4",
  "status": "PLAYING",
  "current_player_id": "player_123",
  "round_number": 1,
  "players": {
    "player_123": {
      "id": "player_123",
      "name": "玩家1",
      "hand_cards": [...],
      "used_actions": [],
      "secret_cards": [],
      "allocated_gifts": {},
      "score": 0,
      "is_current_player": true
    },
    "player_456": {
      "id": "player_456", 
      "name": "玩家2",
      "hand_cards": [...],
      "used_actions": [],
      "secret_cards": [],
      "allocated_gifts": {},
      "score": 0,
      "is_current_player": false
    }
  },
  "geishas": [
    {
      "id": "geisha_5_1",
      "name": "明燈花音",
      "charm": 5,
      "gift_item": "櫻花髮簪",
      "description": "專精於櫻花髮簪的優雅藝妓",
      "favor": "NEUTRAL",
      "allocated_gifts": {}
    }
  ],
  "messages": [],
  "winner": null
}
```

### 2. 獲取遊戲狀態
獲取指定遊戲的完整狀態

**端點**: `GET /api/v1/games/{game_id}`

**成功回應** (200):
```json
{
  "game_id": "46d2c26b-146a-431e-be42-efc3bbc683d4",
  "status": "PLAYING",
  "current_player_id": "player_123",
  "round_number": 2,
  "players": { ... },
  "geishas": [ ... ],
  "messages": [
    {
      "id": "msg_1",
      "type": "PLAYER_ACTION",
      "text": "玩家1執行了秘密保留動作",
      "timestamp": 1640995200000,
      "player_id": "player_123",
      "player_name": "玩家1",
      "action_type": "SECRET"
    }
  ],
  "winner": null
}
```

**遊戲不存在** (404):
```json
{
  "detail": "遊戲未找到"
}
```

### 3. 執行遊戲動作
執行玩家的遊戲動作

**端點**: `POST /api/v1/games/{game_id}/action`

**請求體**:
```json
{
  "player_id": "player_123",
  "action_type": "SECRET",
  "card_ids": ["card_1"],
  "target_geisha_id": null,
  "groupings": null
}
```

**動作類型說明**:
- `SECRET`: 秘密保留（1張卡）
- `DISCARD`: 棄牌（2張卡）
- `GIFT`: 獻禮（3張卡）
- `COMPETE`: 競爭（4張卡，需要groupings）

**獻禮動作範例**:
```json
{
  "player_id": "player_123",
  "action_type": "GIFT", 
  "card_ids": ["card_1", "card_2", "card_3"],
  "groupings": null
}
```

**競爭動作範例**:
```json
{
  "player_id": "player_123",
  "action_type": "COMPETE",
  "card_ids": ["card_1", "card_2", "card_3", "card_4"],
  "groupings": [
    ["card_1", "card_2"],
    ["card_3", "card_4"]
  ]
}
```

**成功回應** (200):
```json
{
  "success": true,
  "message": "動作執行成功",
  "game_state": {
    "game_id": "46d2c26b-146a-431e-be42-efc3bbc683d4",
    "status": "PLAYING",
    "current_player_id": "player_456",
    "round_number": 2,
    "players": { ... },
    "geishas": [ ... ],
    "messages": [ ... ],
    "winner": null
  }
}
```

### 4. 獲取遊戲簡要狀態
獲取遊戲的簡要資訊

**端點**: `GET /api/v1/games/{game_id}/status`

**成功回應** (200):
```json
{
  "game_id": "46d2c26b-146a-431e-be42-efc3bbc683d4",
  "status": "PLAYING",
  "current_player_id": "player_123", 
  "round_number": 2,
  "player_names": ["玩家1", "玩家2"],
  "created_at": "2024-01-01T12:00:00Z",
  "winner": null
}
```

### 5. 重置遊戲
重置遊戲到初始狀態

**端點**: `POST /api/v1/games/{game_id}/reset`

**成功回應** (200):
```json
{
  "success": true,
  "message": "遊戲重置成功",
  "game_state": { ... }
}
```

### 6. 刪除遊戲
刪除指定的遊戲

**端點**: `DELETE /api/v1/games/{game_id}`

**成功回應** (200):
```json
{
  "success": true,
  "message": "遊戲刪除成功"
}
```

### 7. 遊戲列表
獲取所有遊戲的列表

**端點**: `GET /api/v1/games`

**成功回應** (200):
```json
{
  "games": [
    {
      "game_id": "46d2c26b-146a-431e-be42-efc3bbc683d4",
      "status": "PLAYING",
      "player_names": ["玩家1", "玩家2"],
      "created_at": "2024-01-01T12:00:00Z",
      "current_round": 2
    }
  ],
  "total": 1
}
```

## 🎮 遊戲狀態

| 狀態 | 說明 |
|------|------|
| `WAITING` | 等待開始 |
| `PLAYING` | 遊戲進行中 |
| `FINISHED` | 遊戲結束 |

## 🎯 動作類型詳細說明

### 秘密保留 (SECRET)
- **卡牌數量**: 1張
- **效果**: 卡牌保留至回合結束，其他玩家無法看見
- **特點**: 唯一不會被對手干預的動作

### 棄牌 (DISCARD)
- **卡牌數量**: 2張
- **效果**: 直接棄置，不產生任何效果
- **用途**: 處理不需要的卡牌

### 獻禮 (GIFT)
- **卡牌數量**: 3張
- **執行流程**: 
  1. 展示3張卡牌給對手
  2. 對手選擇1張
  3. 對手獲得選中的卡牌
  4. 你獲得剩餘2張卡牌

### 競爭 (COMPETE)
- **卡牌數量**: 4張
- **執行流程**:
  1. 將4張卡牌分成2組
  2. 展示給對手
  3. 對手選擇其中一組
  4. 對手獲得選中的組別
  5. 你獲得另一組

## ⚠️ 錯誤處理

### 無效動作 (400)
```json
{
  "detail": "秘密保留必須選擇1張卡牌"
}
```

### 非當前玩家 (400)
```json
{
  "detail": "不是當前玩家的回合"
}
```

### 動作已使用 (400)
```json
{
  "detail": "本回合已使用過此動作"
}
```

### 遊戲已結束 (400)
```json
{
  "detail": "遊戲已結束，無法執行動作"
}
```