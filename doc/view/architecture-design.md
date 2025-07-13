# 前端架構設計文檔

## 📁 項目架構分層

基於現有的架構模式，按照以下分層進行房間功能開發：

```
src/
├── page/                    # 頁面層 - 路由對應的主要頁面
├── components/              # 組件層 - 可復用的UI組件
├── store/                   # 狀態管理層 - Redux相關
├── services/                # 服務層 - API調用和業務邏輯
├── routes/                  # 路由層 - 路由配置
├── models/                  # 模型層 - TypeScript類型定義
└── utils/                   # 工具層 - 通用工具函數
```

---

## 📄 Page 層設計

### 新增頁面文件

#### `src/page/HomePage.tsx`
```typescript
// 首頁 - 遊戲入口
interface HomePageProps {}

export const HomePage: React.FC<HomePageProps> = () => {
  // 頁面級邏輯
  // - 處理開始遊戲流程
  // - 管理頁面狀態
  // - 錯誤處理
}
```

#### `src/page/WaitingRoomPage.tsx`
```typescript
// 等待房間頁面
interface WaitingRoomPageProps {
  roomId: string; // 從路由參數獲取
}

export const WaitingRoomPage: React.FC<WaitingRoomPageProps> = () => {
  // 頁面級邏輯
  // - WebSocket連接管理
  // - 房間狀態監聽
  // - 遊戲開始跳轉
}
```

#### 保持現有
- `src/page/GamePage.tsx` - 現有遊戲頁面

---

## 🧩 Components 層設計

### 新增組件目錄結構

```
src/components/
├── game/                    # 現有遊戲組件
└── room/                    # 新增房間組件
    ├── JoinGameButton.tsx   # 加入遊戲按鈕
    ├── PlayerList.tsx       # 玩家列表
    ├── PlayerCard.tsx       # 玩家卡片
    ├── RoomStatus.tsx       # 房間狀態
    ├── RoomHeader.tsx       # 房間標題
    ├── GameStartCountdown.tsx # 遊戲開始倒計時
    └── LeaveRoomButton.tsx  # 離開房間按鈕
```

### 組件職責定義

#### `src/components/room/JoinGameButton.tsx`
```typescript
interface JoinGameButtonProps {
  onJoinGame: () => void;
  loading: boolean;
  disabled?: boolean;
  playerName?: string;
}

// 職責：
// - 渲染加入遊戲按鈕UI
// - 處理點擊事件
// - 顯示載入狀態
// - 玩家名稱輸入（可選）
```

#### `src/components/room/PlayerList.tsx`
```typescript
interface PlayerListProps {
  players: RoomPlayer[];
  maxPlayers: number;
  currentPlayerId?: string;
}

// 職責：
// - 渲染玩家列表
// - 顯示空位占位符
// - 標記當前玩家
```

#### `src/components/room/RoomStatus.tsx`
```typescript
interface RoomStatusProps {
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
}

// 職責：
// - 顯示房間當前狀態
// - 狀態對應的文字說明
// - 狀態指示器
```

---

## 🗃️ Store 層設計

### 新增狀態管理文件

#### `src/store/roomSlice.ts`
```typescript
// 房間狀態切片
interface RoomState {
  currentRoom: Room | null;
  joining: boolean;
  leaving: boolean;
  error: string | null;
}

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    // 同步 reducers
    setCurrentRoom,
    updateRoomStatus,
    addPlayerToRoom,
    removePlayerFromRoom,
    clearRoom,
    setJoining,
    setLeaving,
    setError,
    clearError
  }
});
```

#### `src/store/roomThunks.ts`
```typescript
// 房間異步操作
export const joinRoomAsync = createAsyncThunk(
  'room/joinRoom',
  async (playerName: string) => {
    // 調用房間服務API
  }
);

export const leaveRoomAsync = createAsyncThunk(
  'room/leaveRoom', 
  async (roomId: string) => {
    // 調用離開房間API
  }
);
```

#### `src/store/websocketSlice.ts`
```typescript
// WebSocket連接狀態
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
  lastMessage: WebSocketMessage | null;
}
```

#### 更新 `src/store/store.ts`
```typescript
// 添加新的 reducer
export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,      // 現有
    room: roomSlice.reducer,      // 新增
    websocket: websocketSlice.reducer, // 新增
  },
});
```

---

## 🌐 Services 層設計

### 新增服務文件

#### `src/services/roomApi.ts`
```typescript
// 房間相關API服務
export class RoomApiService {
  // 加入房間
  async joinRoom(playerName: string): Promise<RoomResponse>
  
  // 獲取房間狀態
  async getRoomStatus(roomId: string): Promise<RoomResponse>
  
  // 離開房間
  async leaveRoom(roomId: string, playerId: string): Promise<LeaveRoomResponse>
}

export const roomApi = new RoomApiService();
```

#### `src/services/websocketService.ts`
```typescript
// WebSocket連接管理服務
export class WebSocketService {
  private roomWs: WebSocket | null = null;
  private gameWs: WebSocket | null = null;
  
  // 連接房間WebSocket
  connectToRoom(roomId: string): Promise<void>
  
  // 連接遊戲WebSocket  
  connectToGame(gameId: string): Promise<void>
  
  // 發送訊息
  sendMessage(type: string, data: any): void
  
  // 斷開連接
  disconnect(): void
  
  // 事件監聽
  onMessage(callback: (message: WebSocketMessage) => void): void
  onError(callback: (error: Error) => void): void
  onClose(callback: () => void): void
}

export const websocketService = new WebSocketService();
```

#### 保持現有
- `src/services/apiClient.ts` - 現有API客戶端
- `src/services/gameApi.ts` - 現有遊戲API

---

## 🛣️ Routes 層設計

#### 更新 `src/routes/RouteConf.tsx`
```typescript
// 路由配置
export const RouteConf: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 等待房間 */}
        <Route path="/room/:roomId" element={<WaitingRoomPage />} />
        
        {/* 遊戲頁面 */}
        <Route path="/game/:gameId" element={<GamePage />} />
        
        {/* 重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## 📋 Models 層設計

### 新增類型定義文件

#### `src/models/room.ts`
```typescript
// 房間相關類型定義
export interface Room {
  room_id: string;
  status: RoomStatus;
  players: RoomPlayer[];
  max_players: number;
  game_id: string | null;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface RoomPlayer {
  player_id: string;
  player_name: string;
  status: PlayerStatus;
  joined_at: string;
  last_seen: string;
}

export enum RoomStatus {
  WAITING = "waiting",
  STARTING = "starting", 
  PLAYING = "playing",
  FINISHED = "finished",
  ABANDONED = "abandoned"
}

export enum PlayerStatus {
  WAITING = "waiting",
  READY = "ready",
  PLAYING = "playing", 
  DISCONNECTED = "disconnected"
}
```

#### `src/models/websocket.ts`
```typescript
// WebSocket相關類型
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  from?: string;
  to?: string;
}

export interface RoomEvent {
  type: 'player_joined' | 'player_left' | 'game_started' | 'room_status_changed';
  data: any;
}

export interface GameEvent {
  type: 'game_state_update' | 'player_action' | 'opponent_choice';
  data: any;
}
```

#### 保持現有
- `src/models/game.ts` - 現有遊戲類型

---

## 🛠️ Utils 層設計

### 新增工具函數

#### `src/utils/roomUtils.ts`
```typescript
// 房間相關工具函數
export const roomUtils = {
  // 生成玩家ID
  generatePlayerId: (): string => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // 獲取房間狀態文字
  getRoomStatusText: (status: RoomStatus): string => {
    const statusMap = {
      [RoomStatus.WAITING]: "等待玩家加入...",
      [RoomStatus.STARTING]: "遊戲即將開始！", 
      [RoomStatus.PLAYING]: "遊戲進行中",
      [RoomStatus.FINISHED]: "遊戲已結束",
      [RoomStatus.ABANDONED]: "房間已關閉"
    };
    return statusMap[status];
  },
  
  // 檢查是否為當前玩家
  isCurrentPlayer: (playerId: string, currentPlayerId?: string): boolean => {
    return playerId === currentPlayerId;
  }
};
```

#### `src/utils/websocketUtils.ts`
```typescript
// WebSocket相關工具
export const websocketUtils = {
  // 構建WebSocket URL
  buildRoomWsUrl: (roomId: string, playerId: string): string => {
    return `ws://localhost:8080/ws/room/${roomId}?player_id=${playerId}`;
  },
  
  buildGameWsUrl: (gameId: string, playerId: string): string => {
    return `ws://localhost:8080/ws/game/${gameId}?player_id=${playerId}`;
  },
  
  // 創建WebSocket訊息
  createMessage: (type: string, data: any): WebSocketMessage => {
    return {
      type,
      data,
      timestamp: Date.now()
    };
  }
};
```

---

## 🔄 數據流設計

### 房間加入流程
```
HomePage (用戶點擊) 
  ↓
roomThunks.joinRoomAsync (異步操作)
  ↓  
roomApi.joinRoom (API調用)
  ↓
roomSlice.setCurrentRoom (狀態更新)
  ↓
WaitingRoomPage (頁面跳轉)
  ↓
websocketService.connectToRoom (WebSocket連接)
```

### 房間狀態同步流程
```
WebSocket 收到訊息
  ↓
websocketService.onMessage (服務層處理)
  ↓
roomSlice.updateRoomStatus (狀態更新)
  ↓
組件重渲染 (UI更新)
```

---

## 📦 依賴關係

### 各層依賴規則
```
Page 層 → Store 層 + Components 層
Components 層 → Models 層 + Utils 層
Store 層 → Services 層 + Models 層  
Services 層 → Models 層 + Utils 層
Routes 層 → Page 層
Models 層 → 無依賴
Utils 層 → 無依賴
```

### 禁止的依賴
- Services 不能依賴 Store
- Components 不能直接調用 Services  
- Utils 不能依賴其他層級
- Models 不能依賴其他層級

---

## 🚀 開發順序建議

### Phase 1: 基礎架構
1. 建立 Models 層類型定義
2. 建立 Utils 層工具函數
3. 建立 Services 層API服務

### Phase 2: 狀態管理
1. 建立 Store 層 slice 和 thunks
2. 更新 store 配置

### Phase 3: 組件開發
1. 開發基礎 Components
2. 開發 Page 層頁面
3. 更新 Routes 配置

### Phase 4: 整合測試
1. API 整合測試
2. WebSocket 連接測試
3. 端到端流程測試