# 資料結構 (Schemas)

定義所有API中使用的資料結構和類型。

## 🎮 遊戲相關模型

### Game (遊戲)
```json
{
  "game_id": "string",
  "status": "WAITING | PLAYING | FINISHED",
  "current_player_id": "string",
  "round_number": "number",
  "players": {
    "player_id": "Player"
  },
  "geishas": "Geisha[]",
  "messages": "GameMessage[]",
  "winner": "string | null",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Player (玩家)
```json
{
  "id": "string",
  "name": "string",
  "hand_cards": "GiftCard[]",
  "used_actions": "ActionType[]",
  "secret_cards": "GiftCard[]",
  "allocated_gifts": {
    "geisha_id": "GiftCard[]"
  },
  "score": "number",
  "is_current_player": "boolean"
}
```

### Geisha (藝妓)
```json
{
  "id": "string",
  "name": "string", 
  "charm": "number",
  "gift_item": "string",
  "description": "string",
  "favor": "NEUTRAL | PLAYER1 | PLAYER2",
  "allocated_gifts": {
    "player_id": "GiftCard[]"
  }
}
```

### GiftCard (禮物卡)
```json
{
  "id": "string",
  "geisha_id": "string",
  "item_name": "string",
  "charm_value": "number",
  "status": "IN_DECK | IN_HAND | ALLOCATED | SECRET | DISCARDED",
  "owner_id": "string | null"
}
```

### GameMessage (遊戲訊息)
```json
{
  "id": "string",
  "type": "SYSTEM | INFO | PLAYER_ACTION | SUCCESS | ERROR",
  "text": "string",
  "timestamp": "number",
  "player_id": "string | null",
  "player_name": "string | null", 
  "action_type": "ActionType | null",
  "details": "object | null"
}
```

## 🏠 房間相關模型

### Room (房間)
```json
{
  "room_id": "string",
  "status": "waiting | starting | playing | finished | abandoned",
  "players": "RoomPlayer[]",
  "max_players": "number",
  "game_id": "string | null",
  "created_at": "string (ISO 8601)",
  "started_at": "string (ISO 8601) | null",
  "finished_at": "string (ISO 8601) | null"
}
```

### RoomPlayer (房間玩家)
```json
{
  "player_id": "string",
  "player_name": "string",
  "status": "waiting | ready | playing | disconnected",
  "joined_at": "string (ISO 8601)",
  "last_seen": "string (ISO 8601)"
}
```

## 🎯 動作相關模型

### ActionRequest (動作請求)
```json
{
  "player_id": "string",
  "action_type": "ActionType",
  "card_ids": "string[]",
  "target_geisha_id": "string | null",
  "groupings": "string[][] | null"
}
```

### ActionResponse (動作回應)
```json
{
  "success": "boolean",
  "message": "string",
  "game_state": "Game",
  "action_id": "string",
  "next_player_id": "string",
  "requires_opponent_choice": "boolean"
}
```

### ActionHistory (動作歷史)
```json
{
  "action_id": "string",
  "game_id": "string",
  "player_id": "string", 
  "action_type": "ActionType",
  "card_ids": "string[]",
  "result": "object",
  "round_number": "number",
  "action_sequence": "number",
  "created_at": "string (ISO 8601)"
}
```

## 📊 統計相關模型

### GameStats (遊戲統計)
```json
{
  "game_id": "string",
  "total_rounds": "number",
  "total_actions": "number",
  "total_messages": "number",
  "duration_seconds": "number",
  "player_stats": {
    "player_id": {
      "actions_count": {
        "SECRET": "number",
        "DISCARD": "number", 
        "GIFT": "number",
        "COMPETE": "number"
      },
      "final_score": "number",
      "geishas_won": "number"
    }
  }
}
```

### PlayerProfile (玩家檔案)
```json
{
  "player_id": "string",
  "player_name": "string",
  "total_games": "number",
  "wins": "number",
  "losses": "number",
  "win_rate": "number",
  "favorite_action": "ActionType",
  "average_game_duration": "number",
  "created_at": "string (ISO 8601)",
  "last_played": "string (ISO 8601)"
}
```

## 🔔 WebSocket 訊息模型

### WebSocketMessage (WebSocket訊息)
```json
{
  "type": "string",
  "data": "object",
  "timestamp": "number",
  "from": "string | null",
  "to": "string | null"
}
```

### ConnectionInfo (連接資訊)
```json
{
  "connection_id": "string",
  "player_id": "string",
  "room_id": "string | null",
  "game_id": "string | null",
  "connected_at": "string (ISO 8601)",
  "last_ping": "string (ISO 8601)"
}
```

## 📝 請求/回應模型

### CreateGameRequest (創建遊戲請求)
```json
{
  "player1_name": "string",
  "player2_name": "string",
  "room_id": "string | null"
}
```

### JoinRoomRequest (加入房間請求)
```json
{
  "player_name": "string",
  "player_id": "string | null"
}
```

### LeaveRoomRequest (離開房間請求)
```json
{
  "player_id": "string",
  "reason": "string | null"
}
```

### GameListResponse (遊戲列表回應)
```json
{
  "games": "GameListItem[]",
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### GameListItem (遊戲列表項目)
```json
{
  "game_id": "string",
  "status": "string",
  "player_names": "string[]",
  "created_at": "string (ISO 8601)",
  "current_round": "number"
}
```

### RoomListResponse (房間列表回應)
```json
{
  "rooms": "RoomListItem[]",
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### RoomListItem (房間列表項目)
```json
{
  "room_id": "string",
  "status": "string",
  "player_count": "number",
  "max_players": "number",
  "game_id": "string | null",
  "created_at": "string (ISO 8601)"
}
```

## 📋 枚舉類型

### ActionType (動作類型)
```typescript
enum ActionType {
  SECRET = "SECRET",    // 秘密保留
  DISCARD = "DISCARD",  // 棄牌
  GIFT = "GIFT",        // 獻禮
  COMPETE = "COMPETE"   // 競爭
}
```

### GameStatus (遊戲狀態)
```typescript
enum GameStatus {
  WAITING = "WAITING",   // 等待開始
  PLAYING = "PLAYING",   // 進行中
  FINISHED = "FINISHED"  // 已結束
}
```

### FavorStatus (青睞狀態)
```typescript
enum FavorStatus {
  NEUTRAL = "NEUTRAL",   // 中立
  PLAYER1 = "PLAYER1",   // 玩家1
  PLAYER2 = "PLAYER2"    // 玩家2
}
```

### CardStatus (卡牌狀態)
```typescript
enum CardStatus {
  IN_DECK = "IN_DECK",       // 在牌庫中
  IN_HAND = "IN_HAND",       // 在手牌中
  ALLOCATED = "ALLOCATED",   // 已分配
  SECRET = "SECRET",         // 秘密保留
  DISCARDED = "DISCARDED"    // 已棄置
}
```

### MessageType (訊息類型)
```typescript
enum MessageType {
  SYSTEM = "SYSTEM",           // 系統訊息
  INFO = "INFO",               // 資訊
  PLAYER_ACTION = "PLAYER_ACTION", // 玩家動作
  SUCCESS = "SUCCESS",         // 成功
  ERROR = "ERROR"              // 錯誤
}
```

### RoomStatus (房間狀態)
```typescript
enum RoomStatus {
  WAITING = "waiting",       // 等待玩家
  STARTING = "starting",     // 準備開始
  PLAYING = "playing",       // 遊戲中
  FINISHED = "finished",     // 已結束
  ABANDONED = "abandoned"    // 已放棄
}
```

## ⚠️ 錯誤回應模型

### ErrorResponse (錯誤回應)
```json
{
  "success": false,
  "error": "string",
  "message": "string",
  "code": "number",
  "details": "object | null",
  "timestamp": "string (ISO 8601)"
}
```

### ValidationError (驗證錯誤)
```json
{
  "field": "string",
  "message": "string",
  "value": "any"
}
```

## 📏 資料限制

### 字串長度限制
- `player_name`: 1-50 字符
- `room_id`: 固定格式 "room_" + UUID
- `game_id`: UUID格式
- `message.text`: 1-500 字符

### 數值範圍
- `charm_value`: 2-5
- `round_number`: 1-99
- `player_count`: 0-2
- `action_sequence`: 1-4

### 陣列大小限制
- `hand_cards`: 最多6張
- `card_ids`: 1-4張（根據動作類型）
- `messages`: 最多100條（自動清理舊訊息）

## 🔄 版本相容性

- **v1.0**: 當前版本，所有模型穩定
- **向後相容**: 新增欄位不會破壞現有客戶端
- **棄用策略**: 舊欄位將標記為 `@deprecated` 並在下個大版本移除