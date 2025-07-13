# WebSocket 即時通訊 API

WebSocket提供即時的雙向通訊，確保多人遊戲的同步體驗。

## 🔌 連接端點

### 1. 房間通訊
**連接URL**: `ws://localhost:8080/ws/room/{room_id}`

**用途**: 房間內玩家溝通、狀態同步

**連接參數**:
- `room_id`: 房間ID
- `player_id`: 玩家ID (查詢參數)

**連接範例**:
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/room/room_123456?player_id=player_1');
```

### 2. 遊戲同步
**連接URL**: `ws://localhost:8080/ws/game/{game_id}`

**用途**: 遊戲狀態即時同步、動作通知

**連接參數**:
- `game_id`: 遊戲ID
- `player_id`: 玩家ID (查詢參數)ㄍe

**連接範例**:
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/game/game_789?player_id=player_1');
```

## 📨 訊息格式

所有WebSocket訊息都使用JSON格式：

```json
{
  "type": "事件類型",
  "data": { ... },
  "timestamp": 1640995200000,
  "from": "發送者ID"
}
```

## 🎯 房間事件類型

### 玩家加入房間
**類型**: `player_joined`

**客戶端發送**:
```json
{
  "type": "join_room",
  "data": {
    "player_id": "player_1",
    "player_name": "玩家1"
  }
}
```

**服務器廣播**:
```json
{
  "type": "player_joined",
  "data": {
    "player_id": "player_1", 
    "player_name": "玩家1",
    "room_status": "waiting",
    "player_count": 1
  },
  "timestamp": 1640995200000
}
```

### 玩家離開房間
**類型**: `player_left`

**客戶端發送**:
```json
{
  "type": "leave_room",
  "data": {
    "player_id": "player_1"
  }
}
```

**服務器廣播**:
```json
{
  "type": "player_left",
  "data": {
    "player_id": "player_1",
    "player_name": "玩家1", 
    "room_status": "waiting",
    "player_count": 0
  },
  "timestamp": 1640995200000
}
```

### 遊戲開始
**類型**: `game_started`

**服務器廣播**:
```json
{
  "type": "game_started",
  "data": {
    "game_id": "game_789",
    "players": [
      {
        "player_id": "player_1",
        "player_name": "玩家1"
      },
      {
        "player_id": "player_2", 
        "player_name": "玩家2"
      }
    ],
    "current_player": "player_1"
  },
  "timestamp": 1640995200000
}
```

## 🎮 遊戲事件類型

### 遊戲狀態同步
**類型**: `game_state_update`

**服務器廣播**:
```json
{
  "type": "game_state_update",
  "data": {
    "game_id": "game_789",
    "current_player_id": "player_2",
    "round_number": 2,
    "players": { ... },
    "geishas": [ ... ],
    "last_action": {
      "player_id": "player_1",
      "action_type": "SECRET", 
      "timestamp": 1640995200000
    }
  },
  "timestamp": 1640995200000
}
```

### 玩家動作執行
**類型**: `player_action`

**客戶端發送**:
```json
{
  "type": "player_action",
  "data": {
    "action_type": "SECRET",
    "card_ids": ["card_1"],
    "groupings": null
  }
}
```

**服務器廣播**:
```json
{
  "type": "player_action",
  "data": {
    "player_id": "player_1",
    "player_name": "玩家1",
    "action_type": "SECRET",
    "action_description": "執行了秘密保留動作",
    "next_player": "player_2"
  },
  "timestamp": 1640995200000,
  "from": "player_1"
}
```

### 對手選擇回應
**類型**: `opponent_choice`

用於獻禮和競爭動作的對手選擇

**客戶端發送**:
```json
{
  "type": "opponent_choice",
  "data": {
    "choice_type": "gift_selection",
    "selected_cards": ["card_2"],
    "action_id": "action_123"
  }
}
```

**服務器廣播**:
```json
{
  "type": "opponent_choice",
  "data": {
    "player_id": "player_2",
    "choice_type": "gift_selection", 
    "selected_cards": ["card_2"],
    "remaining_cards": ["card_1", "card_3"],
    "action_completed": true
  },
  "timestamp": 1640995200000,
  "from": "player_2"
}
```

### 回合結束
**類型**: `round_ended`

**服務器廣播**:
```json
{
  "type": "round_ended",
  "data": {
    "round_number": 1,
    "geisha_favors": {
      "geisha_5_1": "player_1",
      "geisha_4_1": "NEUTRAL"
    },
    "scores": {
      "player_1": {
        "geishas": 1,
        "charm_points": 5
      },
      "player_2": {
        "geishas": 0,
        "charm_points": 0
      }
    },
    "next_round": 2
  },
  "timestamp": 1640995200000
}
```

### 遊戲結束
**類型**: `game_ended`

**服務器廣播**:
```json
{
  "type": "game_ended",
  "data": {
    "winner": "player_1",
    "win_condition": "charm_points",
    "final_scores": {
      "player_1": {
        "geishas": 3,
        "charm_points": 11
      },
      "player_2": {
        "geishas": 2,
        "charm_points": 7
      }
    },
    "game_duration": 1800000
  },
  "timestamp": 1640995200000
}
```

## 💬 聊天訊息

### 房間聊天
**類型**: `chat_message`

**客戶端發送**:
```json
{
  "type": "chat_message",
  "data": {
    "message": "你好！準備好開始遊戲了嗎？"
  }
}
```

**服務器廣播**:
```json
{
  "type": "chat_message",
  "data": {
    "player_id": "player_1",
    "player_name": "玩家1",
    "message": "你好！準備好開始遊戲了嗎？"
  },
  "timestamp": 1640995200000,
  "from": "player_1"
}
```

## 🔔 系統通知

### 連接確認
**類型**: `connection_established`

**服務器發送**:
```json
{
  "type": "connection_established",
  "data": {
    "player_id": "player_1",
    "room_id": "room_123456",
    "connection_time": 1640995200000
  },
  "timestamp": 1640995200000
}
```

### 錯誤通知
**類型**: `error`

**服務器發送**:
```json
{
  "type": "error",
  "data": {
    "error_code": "INVALID_ACTION",
    "message": "不是你的回合",
    "details": {
      "current_player": "player_2",
      "your_player_id": "player_1"
    }
  },
  "timestamp": 1640995200000
}
```

### 心跳檢測
**類型**: `ping` / `pong`

**客戶端發送**:
```json
{
  "type": "ping"
}
```

**服務器回應**:
```json
{
  "type": "pong",
  "timestamp": 1640995200000
}
```

## 🔐 連接驗證

### 連接時驗證
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/room/room_123456?player_id=player_1&token=jwt_token');
```

### 驗證失敗
**類型**: `auth_error`

```json
{
  "type": "auth_error",
  "data": {
    "error": "INVALID_TOKEN",
    "message": "無效的認證令牌"
  },
  "timestamp": 1640995200000
}
```

## 📋 最佳實踐

1. **連接管理**
   - 實現自動重連機制
   - 處理網路斷線情況
   - 定期發送心跳檢測

2. **訊息處理**
   - 驗證收到的訊息格式
   - 實現訊息去重機制
   - 處理訊息順序問題

3. **錯誤處理**
   - 監聽連接錯誤事件
   - 實現降級方案
   - 提供用戶友好的錯誤提示

4. **性能優化**
   - 避免頻繁發送訊息
   - 實現訊息批處理
   - 使用適當的緩衝機制