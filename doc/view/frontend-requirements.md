# 前端開發需求與設計

## 📋 React 應用架構分析

### 當前架構狀態
- **框架**：React + TypeScript
- **狀態管理**：Redux Toolkit
- **路由**：React Router
- **API層**：自定義服務層 (`gameApi.ts`)
- **組件結構**：分層架構，職責分離

### 現有架構分析
```
src/
├── page/                      # 頁面層 - 路由對應的主要頁面
│   └── GamePage.tsx
├── components/game/           # 組件層 - 遊戲相關UI組件
│   ├── ActionExecutionArea.tsx
│   ├── ActionSelection.tsx
│   ├── CardReceivedNotification.tsx
│   ├── GameMessages.tsx
│   ├── GameStatus.tsx
│   ├── GeishaDisplay.tsx
│   ├── GeishaInfluenceDisplay.tsx
│   ├── HandCards.tsx
│   ├── InfluenceArea.tsx
│   └── OpponentActionStatus.tsx
├── store/                     # 狀態管理層 - Redux相關
│   ├── gameSlice.ts
│   ├── gameThunks.ts
│   └── store.ts
├── services/                  # 服務層 - API調用和業務邏輯
│   ├── apiClient.ts
│   └── gameApi.ts
├── routes/                    # 路由層 - 路由配置
│   └── RouteConf.tsx
├── models/                    # 模型層 - TypeScript類型定義
│   └── game.ts
└── utils/                     # 工具層 - 通用工具函數
```

---

## 🎯 按架構分層的新增功能

### 1. Page 層（頁面層）
需要新增的頁面文件：

#### `page/`
- **`HomePage.tsx`** - 首頁（遊戲入口）
- **`WaitingRoomPage.tsx`** - 等待房間頁面

### 2. Components 層（組件層）
需要新增的組件目錄：

#### `components/room/`
- **`JoinGameButton.tsx`** - 加入遊戲按鈕
- **`PlayerList.tsx`** - 玩家列表顯示
- **`PlayerCard.tsx`** - 玩家卡片
- **`RoomStatus.tsx`** - 房間狀態顯示
- **`RoomHeader.tsx`** - 房間標題資訊
- **`GameStartCountdown.tsx`** - 遊戲開始倒計時
- **`LeaveRoomButton.tsx`** - 離開房間按鈕

### 3. Store 層（狀態管理層）
需要新增的狀態管理文件：

#### `store/`
- **`roomSlice.ts`** - 房間狀態切片
- **`roomThunks.ts`** - 房間異步操作
- **`websocketSlice.ts`** - WebSocket 連接狀態
- 更新 **`store.ts`** - 添加新的 reducer

### 4. Services 層（服務層）
需要新增的服務文件：

#### `services/`
- **`roomApi.ts`** - 房間相關 API 服務
- **`websocketService.ts`** - WebSocket 連接管理服務

### 5. Routes 層（路由層）
需要更新的路由配置：

#### `routes/`
- 更新 **`RouteConf.tsx`** - 添加房間相關路由

### 6. Models 層（模型層）
需要新增的類型定義：

#### `models/`
- **`room.ts`** - 房間相關類型定義
- **`websocket.ts`** - WebSocket 相關類型定義

### 7. Utils 層（工具層）
需要新增的工具函數：

#### `utils/`
- **`roomUtils.ts`** - 房間相關工具函數
- **`websocketUtils.ts`** - WebSocket 相關工具函數

---

## 🚀 用戶流程設計

### 主要用戶路徑
```
首頁 → 點擊開始遊戲 → 自動加入房間 → 等待房間 → 遊戲開始 → 遊戲頁面
  ↓         ↓            ↓           ↓          ↓         ↓
HomePage  JoinGame    RoomAPI    WaitingRoom  GameStart  GamePage
```

### 路由結構
```typescript
/                    # 首頁
/room/:roomId        # 房間等待頁面  
/game/:gameId        # 遊戲頁面
```

---

## 📊 狀態管理設計

### Room State Shape
```typescript
interface RoomState {
  currentRoom: {
    room_id: string | null;
    status: 'waiting' | 'starting' | 'playing' | 'finished';
    players: RoomPlayer[];
    max_players: number;
    game_id: string | null;
    created_at: string;
  } | null;
  joinLoading: boolean;
  leaveLoading: boolean;
  error: string | null;
}
```

### WebSocket State Shape
```typescript
interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  roomConnection: WebSocket | null;
  gameConnection: WebSocket | null;
  lastMessage: any;
}
```

---

## 🎨 UI/UX 設計需求

### 1. 首頁設計
- **簡潔的開始遊戲按鈕**
- **遊戲規則說明連結**
- **版本資訊**

### 2. 房間等待界面
- **房間ID顯示**
- **玩家列表（頭像、姓名、狀態）**
- **等待動畫/進度指示**
- **離開房間按鈕**
- **遊戲即將開始倒計時**

### 3. 即時反饋
- **玩家加入/離開動畫**
- **連接狀態指示器**
- **錯誤訊息 Toast**
- **Loading 狀態**

---

## 🔌 WebSocket 整合策略

### 連接管理
```typescript
class WebSocketManager {
  private roomWs: WebSocket | null = null;
  private gameWs: WebSocket | null = null;
  
  connectToRoom(roomId: string): Promise<void>
  connectToGame(gameId: string): Promise<void>
  disconnect(): void
  sendMessage(type: string, data: any): void
}
```

### 事件處理
```typescript
// 房間事件
- player_joined: 玩家加入
- player_left: 玩家離開  
- game_started: 遊戲開始
- room_status_changed: 房間狀態變更

// 遊戲事件
- game_state_update: 遊戲狀態更新
- player_action: 玩家動作
- opponent_choice: 對手選擇
```

---

## 🛡️ 錯誤處理策略

### 1. API 錯誤處理
- **房間滿員**：顯示友善訊息，提供重試
- **玩家已在房間**：自動跳轉到現有房間
- **網路錯誤**：顯示重試按鈕

### 2. WebSocket 錯誤處理
- **連接失敗**：自動重試機制
- **斷線重連**：背景重連，使用者無感
- **訊息遺失**：狀態同步機制

### 3. 用戶體驗
- **Loading 狀態**：適當的載入動畫
- **錯誤 Toast**：友善的錯誤訊息
- **降級方案**：API 模式 fallback

---

## 📱 響應式設計

### 螢幕適配
- **桌面版**：1024px+ 完整功能
- **平板版**：768px-1023px 適配佈局
- **手機版**：< 768px 精簡界面

### 關鍵斷點
```css
/* 手機優先設計 */
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
```

---

## 🧪 測試策略

### 組件測試
- **房間組件**：加入、等待、離開流程
- **WebSocket Hook**：連接、訊息、錯誤處理
- **狀態管理**：Redux actions 和 reducers

### 整合測試
- **端到端流程**：從首頁到遊戲開始
- **WebSocket 通訊**：即時訊息收發
- **錯誤場景**：網路異常、服務器錯誤

---

## 🚀 開發優先級

### Phase 1: 基礎房間功能
1. 創建房間相關組件
2. 實現房間 API 整合
3. 基礎路由和狀態管理

### Phase 2: WebSocket 整合
1. WebSocket 服務實現
2. 即時狀態同步
3. 錯誤處理和重連

### Phase 3: UI/UX 優化
1. 載入動畫和過渡效果
2. 響應式設計
3. 錯誤訊息優化

### Phase 4: 測試和優化
1. 組件和整合測試
2. 性能優化
3. 瀏覽器相容性測試