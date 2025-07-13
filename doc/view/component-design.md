# 前端組件設計文檔

## 🎯 組件層次結構

### 新增組件樹
```
App
├── HomePage                    # 首頁
│   └── JoinGameButton         # 加入遊戲按鈕
├── WaitingRoomPage           # 等待房間頁面
│   ├── RoomHeader            # 房間標題資訊
│   ├── PlayerList            # 玩家列表
│   │   └── PlayerCard        # 單個玩家卡片
│   ├── RoomStatus            # 房間狀態顯示
│   ├── GameStartCountdown    # 遊戲開始倒計時
│   └── LeaveRoomButton       # 離開房間按鈕
└── GamePage                  # 現有遊戲頁面
```

---

## 📝 詳細組件規格

### 1. HomePage
**路徑**: `src/page/HomePage.tsx`

**功能**: 應用入口頁面，提供遊戲開始功能

**Props**: 無

**State**:
```typescript
interface HomePageState {
  joining: boolean;
  error: string | null;
}
```

**主要功能**:
- 顯示遊戲標題和簡介
- 提供開始遊戲按鈕
- 處理加入房間的載入狀態
- 錯誤訊息顯示

---

### 2. JoinGameButton
**路徑**: `src/components/room/JoinGameButton.tsx`

**功能**: 加入遊戲的主要操作按鈕

**Props**:
```typescript
interface JoinGameButtonProps {
  onJoinGame: () => void;
  loading?: boolean;
  disabled?: boolean;
  playerName?: string;
}
```

**行為**:
- 點擊觸發房間加入邏輯
- 顯示載入狀態
- 處理玩家名稱輸入（可選）

---

### 3. WaitingRoomPage
**路徑**: `src/page/WaitingRoomPage.tsx`

**功能**: 房間等待主頁面

**Props**:
```typescript
interface WaitingRoomPageProps {
  roomId: string;
}
```

**State**:
```typescript
interface WaitingRoomState {
  room: Room | null;
  loading: boolean;
  error: string | null;
  countdown: number | null;
}
```

**生命週期**:
1. 組件掛載時連接WebSocket
2. 監聽房間狀態變化
3. 房間滿員時顯示倒計時
4. 遊戲開始時自動跳轉

---

### 4. PlayerList
**路徑**: `src/components/room/PlayerList.tsx`

**功能**: 顯示房間內所有玩家

**Props**:
```typescript
interface PlayerListProps {
  players: RoomPlayer[];
  maxPlayers: number;
  currentPlayerId?: string;
}
```

**顯示邏輯**:
- 已加入玩家：顯示名稱和狀態
- 空位：顯示等待圖標
- 當前玩家：特殊標記

---

### 5. PlayerCard
**路徑**: `src/components/room/PlayerCard.tsx`

**功能**: 單個玩家資訊卡片

**Props**:
```typescript
interface PlayerCardProps {
  player?: RoomPlayer;
  isCurrentPlayer?: boolean;
  isEmpty?: boolean;
}
```

**狀態顯示**:
```typescript
enum PlayerStatus {
  WAITING = "waiting",     // 等待中
  READY = "ready",         // 準備就緒
  PLAYING = "playing",     // 遊戲中
  DISCONNECTED = "disconnected" // 斷線
}
```

---

### 6. RoomStatus
**路徑**: `src/components/room/RoomStatus.tsx`

**功能**: 房間當前狀態顯示

**Props**:
```typescript
interface RoomStatusProps {
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
}
```

**狀態映射**:
```typescript
const statusMessages = {
  waiting: "等待玩家加入...",
  starting: "遊戲即將開始！",
  playing: "遊戲進行中",
  finished: "遊戲已結束",
  abandoned: "房間已關閉"
};
```

---

### 7. GameStartCountdown
**路徑**: `src/components/room/GameStartCountdown.tsx`

**功能**: 遊戲開始倒計時

**Props**:
```typescript
interface GameStartCountdownProps {
  show: boolean;
  duration?: number; // 預設5秒
  onComplete?: () => void;
}
```

**動畫效果**:
- 數字倒計時動畫
- 進度環顯示
- 音效提示（可選）

---

### 8. WebSocket Hook
**路徑**: `src/hooks/useWebSocket.ts`

**功能**: WebSocket 連接管理

**接口**:
```typescript
interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  sendMessage: (type: string, data: any) => void;
  lastMessage: any;
  connect: (url: string) => void;
  disconnect: () => void;
}

export const useWebSocket = (url?: string): UseWebSocketReturn
```

**功能特點**:
- 自動重連機制
- 心跳檢測
- 錯誤處理
- 訊息隊列

---

### 9. Room Hook
**路徑**: `src/hooks/useRoom.ts`

**功能**: 房間狀態管理

**接口**:
```typescript
interface UseRoomReturn {
  room: Room | null;
  joining: boolean;
  leaving: boolean;
  error: string | null;
  joinRoom: (playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  refreshRoom: () => Promise<void>;
}

export const useRoom = (roomId?: string): UseRoomReturn
```

---

## 🎨 UI 設計規範

### 色彩主題
```css
:root {
  /* 主要色彩 */
  --primary-color: #8B4513;        /* 櫻花褐色 */
  --secondary-color: #FF69B4;      /* 櫻花粉色 */
  --accent-color: #FFD700;         /* 金色點綴 */
  
  /* 狀態色彩 */
  --success-color: #28a745;        /* 成功綠 */
  --warning-color: #ffc107;        /* 警告黃 */
  --error-color: #dc3545;          /* 錯誤紅 */
  --info-color: #17a2b8;           /* 資訊藍 */
  
  /* 灰階 */
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #6c757d;
  --gray-600: #495057;
  --gray-700: #343a40;
  --gray-800: #212529;
}
```

### 字體規範
```css
/* 主要字體 */
.font-primary {
  font-family: "Noto Sans CJK TC", "PingFang TC", sans-serif;
}

/* 標題字體 */
.font-heading {
  font-family: "Noto Serif CJK TC", "PingFang TC", serif;
  font-weight: 700;
}

/* 字體大小 */
.text-xs { font-size: 0.75rem; }    /* 12px */
.text-sm { font-size: 0.875rem; }   /* 14px */
.text-base { font-size: 1rem; }     /* 16px */
.text-lg { font-size: 1.125rem; }   /* 18px */
.text-xl { font-size: 1.25rem; }    /* 20px */
.text-2xl { font-size: 1.5rem; }    /* 24px */
.text-3xl { font-size: 1.875rem; }  /* 30px */
```

### 間距規範
```css
/* 內邊距 */
.p-1 { padding: 0.25rem; }    /* 4px */
.p-2 { padding: 0.5rem; }     /* 8px */
.p-3 { padding: 0.75rem; }    /* 12px */
.p-4 { padding: 1rem; }       /* 16px */
.p-6 { padding: 1.5rem; }     /* 24px */
.p-8 { padding: 2rem; }       /* 32px */

/* 外邊距 */
.m-1 { margin: 0.25rem; }     /* 4px */
.m-2 { margin: 0.5rem; }      /* 8px */
.m-3 { margin: 0.75rem; }     /* 12px */
.m-4 { margin: 1rem; }        /* 16px */
.m-6 { margin: 1.5rem; }      /* 24px */
.m-8 { margin: 2rem; }        /* 32px */
```

---

## 🔄 狀態管理設計

### Room Slice
**路徑**: `src/store/roomSlice.ts`

```typescript
interface RoomState {
  currentRoom: Room | null;
  joining: boolean;
  leaving: boolean;
  error: string | null;
}

// Actions
const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    updateRoomStatus: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.status = action.payload;
      }
    },
    addPlayerToRoom: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.players.push(action.payload);
      }
    },
    removePlayerFromRoom: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.players = state.currentRoom.players
          .filter(p => p.player_id !== action.payload);
      }
    },
    clearRoom: (state) => {
      state.currentRoom = null;
    }
  }
});
```

### WebSocket Slice
**路徑**: `src/store/websocketSlice.ts`

```typescript
interface WebSocketState {
  roomConnection: {
    connected: boolean;
    connecting: boolean;
    error: string | null;
    roomId: string | null;
  };
  gameConnection: {
    connected: boolean;
    connecting: boolean;
    error: string | null;
    gameId: string | null;
  };
  lastMessage: {
    type: string;
    data: any;
    timestamp: number;
  } | null;
}
```

---

## 📱 響應式設計

### 斷點定義
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

### 組件響應式行為

#### PlayerList
- **桌面**: 2列佈局，顯示完整資訊
- **平板**: 2列佈局，簡化資訊
- **手機**: 1列佈局，最精簡資訊

#### RoomStatus  
- **桌面**: 橫向佈局，圖標+文字
- **手機**: 縱向佈局，僅圖標

#### GameStartCountdown
- **桌面**: 大型倒計時器，動畫效果
- **手機**: 緊湊型倒計時器

---

## 🧪 測試策略

### 組件測試案例

#### PlayerList.test.tsx
```typescript
describe('PlayerList Component', () => {
  test('顯示正確的玩家數量', () => {});
  test('標記當前玩家', () => {});
  test('顯示空位占位符', () => {});
  test('響應玩家狀態變化', () => {});
});
```

#### useWebSocket.test.ts
```typescript
describe('useWebSocket Hook', () => {
  test('成功連接WebSocket', () => {});
  test('處理連接錯誤', () => {});
  test('自動重連機制', () => {});
  test('發送和接收訊息', () => {});
});
```

### 整合測試場景
1. **完整房間流程**: 加入→等待→遊戲開始
2. **WebSocket 通訊**: 即時狀態同步
3. **錯誤處理**: 網路斷線恢復
4. **併發場景**: 多人同時加入房間