# 花見小路桌遊 API 文檔總覽

## 📝 API 說明
花見小路桌遊後端提供RESTful API和WebSocket即時通訊，支援完整的遊戲體驗。

## 🌐 基本資訊
- **Base URL**: `http://localhost:8080`
- **API Version**: v1
- **Content-Type**: `application/json`
- **WebSocket URL**: `ws://localhost:8080/ws`

## 📋 API 分類

### 1. 系統相關
| 功能 | 方法 | 端點 | 說明 |
|------|------|------|------|
| 健康檢查 | GET | `/health` | 檢查API服務狀態 |
| API資訊 | GET | `/` | 獲取API基本資訊 |

### 2. 房間管理
| 功能 | 方法 | 端點 | 說明 |
|------|------|------|------|
| 加入房間 | POST | `/api/v1/rooms/join` | 自動分配或創建房間 |
| 房間狀態 | GET | `/api/v1/rooms/{room_id}` | 獲取房間狀態 |
| 離開房間 | DELETE | `/api/v1/rooms/{room_id}/leave` | 離開指定房間 |
| 房間列表 | GET | `/api/v1/rooms` | 獲取所有房間列表 |

### 3. 遊戲管理
| 功能 | 方法 | 端點 | 說明 |
|------|------|------|------|
| 創建遊戲 | POST | `/api/v1/games/create` | 創建新遊戲 |
| 遊戲狀態 | GET | `/api/v1/games/{game_id}` | 獲取完整遊戲狀態 |
| 執行動作 | POST | `/api/v1/games/{game_id}/action` | 執行遊戲動作 |
| 遊戲列表 | GET | `/api/v1/games` | 獲取遊戲列表 |
| 重置遊戲 | POST | `/api/v1/games/{game_id}/reset` | 重置遊戲 |
| 刪除遊戲 | DELETE | `/api/v1/games/{game_id}` | 刪除遊戲 |

### 4. WebSocket 即時通訊
| 連接端點 | 說明 |
|----------|------|
| `/ws/room/{room_id}` | 房間內即時通訊 |
| `/ws/game/{game_id}` | 遊戲內即時同步 |

## 🔐 認證方式
目前為開發階段，暫無認證機制。未來可擴展支援：
- JWT Token 認證
- Session 認證
- WebSocket 連接驗證

## 📊 回應格式

### 成功回應
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 錯誤回應
```json
{
  "success": false,
  "error": "錯誤類型",
  "message": "詳細錯誤訊息",
  "code": 400
}
```

## 🏷️ HTTP 狀態碼
- `200` - 請求成功
- `201` - 資源創建成功
- `400` - 請求參數錯誤
- `404` - 資源未找到
- `409` - 資源衝突
- `500` - 服務器內部錯誤

## 📋 相關文檔
- [房間管理 API](./rooms.md)
- [遊戲管理 API](./games.md)
- [WebSocket 事件](./websocket.md)
- [資料結構](./schemas.md)

## 🔄 版本歷史
- **v1.0.0** (當前版本)
  - 基本遊戲API
  - MongoDB資料持久化
  - WebSocket即時通訊