# 花見小路專案開發計劃

## 📋 專案狀態概覽

### ✅ 已完成
- [x] 後端 FastAPI 基礎架構
- [x] 遊戲核心邏輯實現
- [x] MongoDB 資料層整合
- [x] 前端 React + Redux 基礎架構
- [x] 遊戲 API 串接
- [x] API 文檔編寫
- [x] 用戶故事定義
- [x] 前端架構設計文檔

---

## 🎯 後端開發計劃

### Phase 1: 房間管理核心功能 【可執行】
優先級：🔥 高

#### ✅ 可立即執行
- [ ] **1.1** 實現房間數據模型和 schemas
  - 檔案：`app/schemas/room.py` ✅ 已建立
  - 檔案：`app/domain/entities/room.py` ✅ 已建立
  - 檔案：`app/models/mongodb.py` ✅ 已更新
  - 狀態：🟢 已完成基礎設計，可直接使用

- [ ] **1.2** 實現 MongoDB 房間服務層
  - 檔案：`app/services/mongodb_room_service.py` ✅ 已建立
  - 檔案：`app/services/room_service.py` ✅ 已建立
  - 狀態：🟢 已完成設計，需要測試和調整

- [ ] **1.3** 建立房間管理 API 路由
  - 檔案：`app/api/routes/room.py` ❌ 待建立
  - 依賴：房間服務層
  - 預估時間：2-3 小時

- [ ] **1.4** 在 main.py 中註冊房間路由
  - 檔案：`main.py` 
  - 依賴：房間 API 路由
  - 預估時間：30 分鐘

#### 🔍 需要進一步分析
- [ ] **1.5** 房間與遊戲整合邏輯
  - 自動遊戲創建機制
  - 房間狀態與遊戲狀態同步
  - 依賴：現有遊戲 API 的分析

### Phase 2: WebSocket 即時通訊 【需要研究】
優先級：🟡 中

#### ⚠️ 需要技術調研
- [ ] **2.1** WebSocket 架構設計
  - FastAPI WebSocket 最佳實踐研究
  - 連接管理和狀態同步策略
  - 預估時間：1-2 天研究

- [ ] **2.2** 房間 WebSocket 端點實現
  - 檔案：`app/api/websocket/room.py` ❌ 待建立
  - 依賴：WebSocket 架構設計

- [ ] **2.3** 遊戲 WebSocket 端點實現
  - 檔案：`app/api/websocket/game.py` ❌ 待建立
  - 依賴：WebSocket 架構設計

### Phase 3: 系統優化和測試 【後期執行】
優先級：🟢 低

#### 📋 後期優化項目
- [ ] **3.1** API 性能優化
- [ ] **3.2** 資料庫索引優化
- [ ] **3.3** 錯誤處理完善
- [ ] **3.4** API 測試撰寫

---

## 🎨 前端開發計劃

### Phase 1: 基礎架構搭建 【可執行】
優先級：🔥 高

#### ✅ 可立即執行
- [ ] **F1.1** Models 層類型定義
  - 檔案：`src/models/room.ts` ❌ 待建立
  - 檔案：`src/models/websocket.ts` ❌ 待建立
  - 狀態：🟢 設計完整，可直接實現
  - 預估時間：1-2 小時

- [ ] **F1.2** Utils 層工具函數
  - 檔案：`src/utils/roomUtils.ts` ❌ 待建立
  - 檔案：`src/utils/websocketUtils.ts` ❌ 待建立
  - 狀態：🟢 設計完整，可直接實現
  - 預估時間：1-2 小時

- [ ] **F1.3** Services 層 API 服務
  - 檔案：`src/services/roomApi.ts` ❌ 待建立
  - 狀態：🟢 可先實現 API 調用部分
  - 預估時間：2-3 小時

#### 🟡 需要後端配合
- [ ] **F1.4** WebSocket 服務實現
  - 檔案：`src/services/websocketService.ts` ❌ 待建立
  - 依賴：後端 WebSocket 端點
  - 狀態：🟡 可先實現基礎架構，後期整合

### Phase 2: 狀態管理層 【可執行】
優先級：🔥 高

#### ✅ 可立即執行
- [ ] **F2.1** Room Redux Slice
  - 檔案：`src/store/roomSlice.ts` ❌ 待建立
  - 狀態：🟢 設計完整，可直接實現
  - 預估時間：2-3 小時

- [ ] **F2.2** Room Thunks 異步操作
  - 檔案：`src/store/roomThunks.ts` ❌ 待建立
  - 依賴：roomApi 服務
  - 預估時間：2-3 小時

- [ ] **F2.3** WebSocket Redux Slice
  - 檔案：`src/store/websocketSlice.ts` ❌ 待建立
  - 狀態：🟢 設計完整，可直接實現
  - 預估時間：1-2 小時

- [ ] **F2.4** 更新 Store 配置
  - 檔案：`src/store/store.ts` 🔄 需更新
  - 依賴：新的 slice 文件
  - 預估時間：30 分鐘

### Phase 3: UI 組件層 【可執行】
優先級：🟡 中

#### ✅ 可立即執行
- [ ] **F3.1** 基礎房間組件
  - 檔案：`src/components/room/JoinGameButton.tsx` ❌ 待建立
  - 檔案：`src/components/room/PlayerCard.tsx` ❌ 待建立
  - 檔案：`src/components/room/RoomStatus.tsx` ❌ 待建立
  - 狀態：🟢 設計完整，可直接實現
  - 預估時間：3-4 小時

- [ ] **F3.2** 複合房間組件
  - 檔案：`src/components/room/PlayerList.tsx` ❌ 待建立
  - 檔案：`src/components/room/RoomHeader.tsx` ❌ 待建立
  - 檔案：`src/components/room/GameStartCountdown.tsx` ❌ 待建立
  - 檔案：`src/components/room/LeaveRoomButton.tsx` ❌ 待建立
  - 依賴：基礎組件
  - 預估時間：4-5 小時

### Phase 4: 頁面層 【需要整合】
優先級：🟡 中

#### 🟡 需要整合測試
- [ ] **F4.1** 首頁實現
  - 檔案：`src/page/HomePage.tsx` ❌ 待建立
  - 依賴：JoinGameButton 組件 + roomThunks
  - 預估時間：2-3 小時

- [ ] **F4.2** 等待房間頁面
  - 檔案：`src/page/WaitingRoomPage.tsx` ❌ 待建立
  - 依賴：所有房間組件 + WebSocket 服務
  - 預估時間：4-5 小時

### Phase 5: 路由整合 【最後執行】
優先級：🟢 低

#### 📋 最後整合
- [ ] **F5.1** 更新路由配置
  - 檔案：`src/routes/RouteConf.tsx` 🔄 需更新
  - 依賴：所有頁面組件
  - 預估時間：1 小時

---

## 🚀 建議執行順序

### 階段一：基礎設施搭建（1-2 天）
**可並行執行**

#### 後端部分
1. **1.1** 房間數據模型（已完成，可直接使用）
2. **1.2** MongoDB 房間服務層（已完成，需測試）
3. **1.3** 房間 API 路由實現
4. **1.4** 註冊房間路由

#### 前端部分
1. **F1.1** Models 層類型定義
2. **F1.2** Utils 層工具函數
3. **F1.3** Services 層 API 服務
4. **F2.1-F2.4** 完整狀態管理層

### 階段二：基礎功能實現（2-3 天）
**前端主導，後端配合測試**

#### 前端部分
1. **F3.1** 基礎房間組件
2. **F3.2** 複合房間組件
3. **F4.1** 首頁實現

#### 後端部分
1. **1.5** 房間與遊戲整合邏輯
2. API 測試和調整

### 階段三：WebSocket 整合（3-4 天）
**需要技術調研**

#### 後端部分
1. **2.1** WebSocket 架構設計和調研
2. **2.2** 房間 WebSocket 實現
3. **2.3** 遊戲 WebSocket 實現

#### 前端部分
1. **F1.4** WebSocket 服務整合
2. **F4.2** 等待房間頁面完整實現
3. **F5.1** 路由配置更新

### 階段四：測試和優化（1-2 天）
1. 端到端測試
2. 錯誤處理完善
3. 性能優化
4. UI/UX 調整

---

## ⚠️ 風險點和阻塞項

### 🔴 高風險項目
1. **WebSocket 實現**
   - 技術複雜度較高
   - 需要深入研究 FastAPI WebSocket
   - 狀態同步邏輯複雜

2. **房間與遊戲整合**
   - 涉及現有遊戲邏輯修改
   - 狀態同步邏輯需要仔細設計

### 🟡 中風險項目
1. **前後端 API 整合**
   - 需要前後端密切配合
   - API 格式和錯誤處理需要統一

2. **即時狀態同步**
   - WebSocket 連接穩定性
   - 斷線重連機制

### 🟢 低風險項目
1. 所有 Models、Utils、基礎組件
2. Redux 狀態管理
3. 基礎 API 調用

---

## 📊 預估時間

### 後端開發
- **Phase 1**：3-4 天（包含測試）
- **Phase 2**：4-5 天（包含研究）
- **Phase 3**：2-3 天
- **總計**：9-12 天

### 前端開發
- **Phase 1-2**：3-4 天
- **Phase 3-4**：4-5 天
- **Phase 5**：1 天
- **總計**：8-10 天

### 整體專案
- **總計**：12-15 天（考慮整合和測試時間）

---

## 🎯 里程碑檢查點

### Milestone 1：基礎 API 可用（3-4 天）
- [ ] 房間 API 完整實現
- [ ] 前端 API 調用成功
- [ ] 基礎房間流程可運行

### Milestone 2：完整房間功能（7-8 天）
- [ ] 房間加入流程完整
- [ ] 基礎 UI 組件完成
- [ ] 狀態管理正常運作

### Milestone 3：即時通訊整合（10-12 天）
- [ ] WebSocket 連接穩定
- [ ] 即時狀態同步正常
- [ ] 完整用戶流程可用

### Milestone 4：專案完成（12-15 天）
- [ ] 所有功能測試通過
- [ ] 錯誤處理完善
- [ ] 代碼品質達標