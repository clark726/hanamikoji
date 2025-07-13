# 前端分層職責定義

## 📋 架構分層職責

基於現有的 React 項目架構，明確定義各層的職責邊界和交互規則。

---

## 🎯 各層職責定義

### 1. Page 層（`src/page/`）
**職責**：頁面級組件，對應路由的主要頁面

**具體職責**：
- 作為路由的入口組件
- 管理頁面級的狀態和生命週期
- 協調多個子組件的交互
- 處理頁面級的錯誤邊界
- 管理頁面的 SEO 和元數據

**不應該做**：
- 直接調用 API（應通過 Store 層）
- 包含複雜的 UI 邏輯（應拆分到 Components）
- 處理具體的業務邏輯（應在 Services 層）

**示例職責**：
```typescript
// HomePage.tsx - 首頁頁面組件
const HomePage: React.FC = () => {
  // ✅ 頁面級狀態管理
  // ✅ 協調子組件
  // ✅ 處理路由跳轉
  // ❌ 不直接調用 API
  // ❌ 不包含複雜 UI 邏輯
}
```

---

### 2. Components 層（`src/components/`）
**職責**：可復用的 UI 組件

**具體職責**：
- 純 UI 渲染邏輯
- 組件內部狀態管理（UI 狀態）
- 事件處理和傳遞
- 組件的樣式和動畫
- Props 驗證和預設值

**不應該做**：
- 直接調用 API
- 處理全局狀態（應通過 Props 接收）
- 包含路由邏輯
- 處理業務邏輯

**示例職責**：
```typescript
// JoinGameButton.tsx - 加入遊戲按鈕組件
interface JoinGameButtonProps {
  onJoinGame: () => void;    // ✅ 通過 props 接收事件處理器
  loading: boolean;          // ✅ 通過 props 接收狀態
  disabled?: boolean;
}

const JoinGameButton: React.FC<JoinGameButtonProps> = (props) => {
  // ✅ UI 渲染和事件處理
  // ✅ 組件內部 UI 狀態
  // ❌ 不直接調用 API
  // ❌ 不處理全局狀態
}
```

---

### 3. Store 層（`src/store/`）
**職責**：全局狀態管理

**具體職責**：
- 定義應用的全局狀態結構
- 提供 actions 和 reducers
- 管理異步操作（thunks）
- 狀態的序列化和持久化
- 狀態的派生和選擇器

**不應該做**：
- 直接包含 UI 邏輯
- 直接操作 DOM
- 包含業務邏輯實現（應調用 Services）

**示例職責**：
```typescript
// roomSlice.ts - 房間狀態切片
const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    // ✅ 狀態更新邏輯
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    }
  }
});

// roomThunks.ts - 房間異步操作
export const joinRoomAsync = createAsyncThunk(
  'room/joinRoom',
  async (playerName: string) => {
    // ✅ 調用 Services 層
    const response = await roomApi.joinRoom(playerName);
    return response;
  }
);
```

---

### 4. Services 層（`src/services/`）
**職責**：業務邏輯和 API 調用

**具體職責**：
- API 請求的封裝和處理
- 業務邏輯的實現
- 數據轉換和格式化
- 錯誤處理和重試邏輯
- 緩存和資料持久化

**不應該做**：
- 直接操作 DOM
- 管理 React 狀態
- 包含 UI 相關邏輯

**示例職責**：
```typescript
// roomApi.ts - 房間 API 服務
export class RoomApiService {
  // ✅ API 調用封裝
  async joinRoom(playerName: string): Promise<RoomResponse> {
    // ✅ 數據驗證和轉換
    // ✅ 錯誤處理
    // ✅ 重試邏輯
  }
  
  // ✅ 業務邏輯實現
  async handleRoomJoin(playerName: string): Promise<Room> {
    // 複雜的業務邏輯處理
  }
}
```

---

### 5. Routes 層（`src/routes/`）
**職責**：路由配置和導航

**具體職責**：
- 定義應用的路由結構
- 路由守衛和權限控制
- 路由參數的處理
- 懶載入和代碼分割
- 路由級的錯誤處理

**不應該做**：
- 包含業務邏輯
- 直接管理狀態
- 處理 API 調用

**示例職責**：
```typescript
// RouteConf.tsx - 路由配置
export const RouteConf: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ 路由定義 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<WaitingRoomPage />} />
        
        {/* ✅ 路由守衛 */}
        <Route path="/game/:gameId" element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};
```

---

### 6. Models 層（`src/models/`）
**職責**：類型定義和資料模型

**具體職責**：
- TypeScript 介面和類型定義
- 資料模型的結構定義
- 枚舉和常數定義
- 類型守衛和驗證函數
- API 請求/回應的類型定義

**不應該做**：
- 包含業務邏輯
- 包含狀態管理邏輯
- 依賴其他層級

**示例職責**：
```typescript
// room.ts - 房間相關類型定義
export interface Room {
  room_id: string;
  status: RoomStatus;
  players: RoomPlayer[];
  // ... 其他屬性
}

// ✅ 枚舉定義
export enum RoomStatus {
  WAITING = "waiting",
  STARTING = "starting",
  PLAYING = "playing"
}

// ✅ 類型守衛
export const isValidRoom = (obj: any): obj is Room => {
  return obj && typeof obj.room_id === 'string';
};
```

---

### 7. Utils 層（`src/utils/`）
**職責**：通用工具函數

**具體職責**：
- 純函數工具
- 數據處理和轉換
- 格式化和驗證
- 常用的演算法
- 平台相關的工具

**不應該做**：
- 依賴其他業務層級
- 包含狀態管理
- 直接操作 DOM（除非是 DOM 工具）

**示例職責**：
```typescript
// roomUtils.ts - 房間相關工具
export const roomUtils = {
  // ✅ 純函數工具
  generatePlayerId: (): string => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // ✅ 數據轉換
  getRoomStatusText: (status: RoomStatus): string => {
    // 狀態文字映射
  },
  
  // ✅ 驗證函數
  isCurrentPlayer: (playerId: string, currentPlayerId?: string): boolean => {
    return playerId === currentPlayerId;
  }
};
```

---

## 🔄 層級間的依賴關係

### 允許的依賴方向
```
Page 層 → Store 層 + Components 層
Components 層 → Models 層 + Utils 層
Store 層 → Services 層 + Models 層
Services 層 → Models 層 + Utils 層
Routes 層 → Page 層
```

### 禁止的依賴
```
❌ Services 層 → Store 層
❌ Services 層 → Components 層
❌ Components 層 → Store 層 (直接)
❌ Components 層 → Services 層
❌ Utils 層 → 任何其他層
❌ Models 層 → 任何其他層
```

---

## 📋 數據流規範

### 正確的數據流
```
用戶操作 (Page/Component)
  ↓
dispatch action (Store)
  ↓
thunk 調用 (Store → Services)
  ↓
API 調用 (Services)
  ↓
數據回傳 (Services → Store)
  ↓
狀態更新 (Store)
  ↓
組件重渲染 (Component)
```

### 錯誤的數據流
```
❌ Component 直接調用 Services
❌ Services 直接更新 Store
❌ Page 繞過 Store 直接調用 API
❌ Utils 包含狀態邏輯
```

---

## 🧪 測試責任分工

### Page 層測試
- 路由導航測試
- 頁面整合測試
- 錯誤邊界測試

### Components 層測試
- 單元測試（Props、事件、渲染）
- 快照測試
- 互動測試

### Store 層測試
- Reducer 邏輯測試
- Thunk 異步操作測試
- Selector 測試

### Services 層測試
- API 調用測試
- 業務邏輯測試
- Mock 和 Stub 測試

### Utils 層測試
- 純函數單元測試
- 邊界條件測試
- 性能測試

---

## 🚀 開發最佳實踐

### 1. 單一職責原則
每個文件和函數應該只有一個明確的職責

### 2. 依賴注入
使用依賴注入減少層級間的耦合

### 3. 介面隔離
定義清晰的介面，避免過大的介面

### 4. 開放封閉原則
對擴展開放，對修改封閉

### 5. 錯誤處理
每層都應該有適當的錯誤處理機制