# 房間管理 API

房間管理系統負責自動分配玩家到合適的遊戲房間，實現單一入口的遊戲體驗。

## 📋 API 端點

### 1. 加入房間
自動為玩家分配或創建房間

**端點**: `POST /api/v1/rooms/join`

**請求體**:
```json
{
  "player_name": "玩家名稱",
  "player_id": "可選的玩家ID"
}
```

**成功回應** (200):
```json
{
  "room_id": "room_123456",
  "status": "waiting",
  "players": [
    {
      "player_id": "player_1",
      "player_name": "玩家1",
      "status": "ready"
    }
  ],
  "max_players": 2,
  "created_at": "2024-01-01T12:00:00Z",
  "game_id": null
}
```

**房間已滿時** (201):
```json
{
  "room_id": "room_123456",
  "status": "starting",
  "players": [
    {
      "player_id": "player_1",
      "player_name": "玩家1",
      "status": "ready"
    },
    {
      "player_id": "player_2", 
      "player_name": "玩家2",
      "status": "ready"
    }
  ],
  "max_players": 2,
  "game_id": "game_789",
  "message": "遊戲即將開始"
}
```

### 2. 獲取房間狀態
查詢指定房間的當前狀態

**端點**: `GET /api/v1/rooms/{room_id}`

**成功回應** (200):
```json
{
  "room_id": "room_123456",
  "status": "playing",
  "players": [
    {
      "player_id": "player_1",
      "player_name": "玩家1",
      "status": "playing"
    },
    {
      "player_id": "player_2",
      "player_name": "玩家2", 
      "status": "playing"
    }
  ],
  "game_id": "game_789",
  "started_at": "2024-01-01T12:01:00Z",
  "current_turn": "player_1"
}
```

**房間不存在** (404):
```json
{
  "error": "RoomNotFound",
  "message": "房間不存在"
}
```

### 3. 離開房間
玩家主動離開房間

**端點**: `DELETE /api/v1/rooms/{room_id}/leave`

**請求體**:
```json
{
  "player_id": "player_1"
}
```

**成功回應** (200):
```json
{
  "message": "成功離開房間",
  "room_id": "room_123456",
  "remaining_players": 1
}
```

**房間解散** (200):
```json
{
  "message": "房間已解散",
  "room_id": "room_123456",
  "reason": "所有玩家已離開"
}
```

### 4. 房間列表
獲取所有房間的狀態（管理用途）

**端點**: `GET /api/v1/rooms`

**查詢參數**:
- `status` (可選): 過濾房間狀態 (`waiting`, `playing`, `finished`)
- `limit` (可選): 限制回傳數量，預設20

**成功回應** (200):
```json
{
  "rooms": [
    {
      "room_id": "room_123456",
      "status": "waiting", 
      "player_count": 1,
      "max_players": 2,
      "created_at": "2024-01-01T12:00:00Z"
    },
    {
      "room_id": "room_789012",
      "status": "playing",
      "player_count": 2,
      "max_players": 2,
      "game_id": "game_456",
      "started_at": "2024-01-01T11:30:00Z"
    }
  ],
  "total": 2,
  "page": 1
}
```

## 🏷️ 房間狀態

| 狀態 | 說明 |
|------|------|
| `waiting` | 等待玩家加入 |
| `starting` | 房間已滿，準備開始遊戲 |
| `playing` | 遊戲進行中 |
| `finished` | 遊戲結束 |
| `abandoned` | 房間被放棄（玩家離開）|

## 🎯 自動房間分配邏輯

1. **查找等待中的房間**: 尋找狀態為 `waiting` 的房間
2. **加入現有房間**: 如果有合適的房間，直接加入
3. **房間滿員處理**: 當房間達到2人時，自動開始遊戲
4. **創建新房間**: 沒有合適房間時，創建新的房間

## ⚠️ 錯誤處理

### 房間已滿 (409)
```json
{
  "error": "RoomFull",
  "message": "房間已滿",
  "available_rooms": ["room_789012"]
}
```

### 玩家已在房間中 (409)
```json
{
  "error": "PlayerAlreadyInRoom", 
  "message": "玩家已在其他房間中",
  "current_room": "room_123456"
}
```

### 無效的玩家操作 (400)
```json
{
  "error": "InvalidOperation",
  "message": "遊戲進行中無法離開房間"
}
```