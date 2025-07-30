# 花見小路專案開發計劃

## 🚨 **緊急問題：玩家身份混淆**

### 問題描述
- **現象**：player2 加入連線時，player1 畫面也變成 player2
- **根本原因**：WebSocket 功能完全未使用，依賴 REST API 輪詢導致狀態不同步
- **影響範圍**：多人遊戲核心功能無法正常運作

### 🎯 **立即需要解決的問題**
- [ ] **玩家身份識別邏輯修復** (roomSlice.ts:85, roomThunks.ts:47)
- [ ] **實現 WebSocket 實時通訊** (替代現有輪詢機制)
- [ ] **玩家身份持久化機制** (LocalStorage + Redux)
- [ ] **前後端玩家 ID 生成統一** (目前邏輯不一致)

---

## 📋 專案狀態概覽

### ✅ 已完成
- [x] 後端 FastAPI 基礎架構
- [x] 遊戲核心邏輯實現
- [x] MongoDB 資料層整合
- [x] 前端 React + Redux 基礎架構
- [x] 遊戲 API 串接
- [x] 房間管理 API 完整實現
- [x] 房間前端完整功能實現（但有身份混淆 bug）
- [x] 房間相關所有組件開發完成
- [x] 路由配置更新完成

### 🔍 **發現的問題**
- ❌ **WebSocket 功能完全未使用** - 前端有完整架構但沒有實際調用
- ❌ **後端無 WebSocket 實現** - 只有 REST API
- ❌ **依賴輪詢更新** - 造成狀態不同步
- ❌ **缺乏身份持久化** - 頁面刷新會丟失玩家身份

### 🎯 當前進度重新評估

**Phase 1: 房間管理核心功能** ⚠️ **80% 完成 (有重大 bug)**
- ✅ 後端房間 API 完整實現
- ⚠️ 前端房間功能有玩家身份混淆問題
- ✅ 所有基礎和複合組件完成
- ✅ 頁面和路由配置完成

**Phase 2: WebSocket 即時通訊** ❌ **0% 實際完成**
- ✅ 前端 WebSocket 架構代碼存在但未使用
- ❌ 後端 WebSocket 端點完全未實現
- ❌ API 輪詢導致狀態同步問題

---

## 🎯 後端開發計劃

### Phase 1: 房間管理核心功能 【可執行】
優先級：🔥 高

#### ✅ 已完成
- [x] **1.1** 實現房間數據模型和 schemas
  - 檔案：`app/schemas/room.py` ✅ 已建立
  - 檔案：`app/domain/entities/room.py` ✅ 已建立
  - 檔案：`app/models/mongodb.py` ✅ 已更新
  - 狀態：✅ 完成並可使用

- [x] **1.2** 實現 MongoDB 房間服務層
  - 檔案：`app/services/mongodb_room_service.py` ✅ 已建立
  - 檔案：`app/services/room_service.py` ✅ 已建立
  - 狀態：✅ 完成並可使用

- [x] **1.3** 建立房間管理 API 路由
  - 檔案：`app/api/routes/room.py` ✅ 已完成
  - 狀態：✅ 完整實現所有端點

- [x] **1.4** 在 main.py 中註冊房間路由
  - 檔案：`main.py` ✅ 已完成
  - 狀態：✅ 路由已正確註冊

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

#### ✅ 已完成
- [x] **F1.1** Models 層類型定義
  - 檔案：`src/models/room.ts` ✅ 已完成
  - 檔案：`src/models/websocket.ts` ✅ 已完成
  - 狀態：✅ 完整 TypeScript 類型定義

- [x] **F1.2** Utils 層工具函數
  - 檔案：`src/utils/roomUtils.ts` ✅ 已完成
  - 檔案：`src/utils/websocketUtils.ts` ✅ 已完成
  - 狀態：✅ 完整工具函數庫

- [x] **F1.3** Services 層 API 服務
  - 檔案：`src/services/roomApi.ts` ✅ 已完成
  - 狀態：✅ 完整 API 服務實現

#### 🟡 需要後端配合
- [ ] **F1.4** WebSocket 服務實現
  - 檔案：`src/services/websocketService.ts` ❌ 待建立
  - 依賴：後端 WebSocket 端點
  - 狀態：🟡 可先實現基礎架構，後期整合

### Phase 2: 狀態管理層 【可執行】
優先級：🔥 高

#### ✅ 已完成
- [x] **F2.1** Room Redux Slice
  - 檔案：`src/store/roomSlice.ts` ✅ 已完成
  - 狀態：✅ 完整狀態管理實現

- [x] **F2.2** Room Thunks 異步操作
  - 檔案：`src/store/roomThunks.ts` ✅ 已完成
  - 狀態：✅ 完整異步操作實現

- [x] **F2.3** WebSocket Redux Slice
  - 檔案：`src/store/websocketSlice.ts` ✅ 已完成
  - 狀態：✅ 完整 WebSocket 狀態管理

- [x] **F2.4** 更新 Store 配置
  - 檔案：`src/store/store.ts` ✅ 已完成
  - 狀態：✅ 所有 reducer 已註冊

### Phase 3: UI 組件層 【可執行】
優先級：🟡 中

#### ✅ 已完成
- [x] **F3.1** 基礎房間組件
  - 檔案：`src/components/room/JoinGameButton.tsx` ✅ 已完成
  - 檔案：`src/components/room/PlayerCard.tsx` ✅ 已完成
  - 檔案：`src/components/room/RoomStatus.tsx` ✅ 已完成
  - 狀態：✅ 完整基礎組件實現

- [x] **F3.2** 複合房間組件
  - 檔案：`src/components/room/PlayerList.tsx` ✅ 已完成
  - 檔案：`src/components/room/RoomHeader.tsx` ✅ 已完成
  - 檔案：`src/components/room/GameStartCountdown.tsx` ✅ 已完成
  - 檔案：`src/components/room/LeaveRoomButton.tsx` ✅ 已完成
  - 狀態：✅ 完整複合組件實現

### Phase 4: 頁面層 【需要整合】
優先級：🟡 中

#### ✅ 已完成
- [x] **F4.1** 首頁實現
  - 檔案：`src/page/HomePage.tsx` ✅ 已完成
  - 狀態：✅ 完整首頁功能實現

- [x] **F4.2** 等待房間頁面
  - 檔案：`src/page/WaitingRoomPage.tsx` ✅ 已完成
  - 狀態：✅ 完整等待房間功能實現

### Phase 5: 路由整合 【最後執行】
優先級：🟢 低

#### ✅ 已完成
- [x] **F5.1** 更新路由配置
  - 檔案：`src/routes/RouteConf.tsx` ✅ 已完成
  - 狀態：✅ 所有路由已配置完成

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

### Milestone 1：基礎 API 可用 ✅ 已完成
- [x] 房間 API 完整實現
- [x] 前端 API 調用成功
- [x] 基礎房間流程可運行

### Milestone 2：完整房間功能 ✅ 已完成
- [x] 房間加入流程完整
- [x] 基礎 UI 組件完成
- [x] 狀態管理正常運作

### Milestone 3：即時通訊整合（進行中）
- [x] 前端 WebSocket 狀態管理完成
- [ ] 後端 WebSocket 端點實現
- [x] 完整用戶流程可用（API 輪詢模式）

### Milestone 4：專案完成（進行中）
- [x] 基礎功能測試通過
- [x] 錯誤處理完善
- [x] 代碼品質達標
- [ ] WebSocket 即時通訊整合