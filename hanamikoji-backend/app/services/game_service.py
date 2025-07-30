"""遊戲服務層"""

from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
import uuid
from datetime import datetime

from app.domain.factories.game_factory import GameInitializationService
from app.domain.entities.game import Game
from app.domain.enums.game_enums import GameStatus, ActionType
from app.schemas.game import ActionRequest, GameStateResponse
from app.services.mongodb_game_service import MongoDBGameService
from app.database.mongodb import init_mongodb


class GameService:
    """遊戲服務"""
    
    _instance = None
    
    def __new__(cls, db: Session = None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, db: Session = None):
        if hasattr(self, '_initialized'):
            return
        self.db = db
        self.game_init_service = GameInitializationService()
        
        # 暫時使用內存存儲，確保功能正常
        self._games: Dict[str, Dict] = {}
        # 記錄每個遊戲的創建者和玩家會話
        self._game_sessions: Dict[str, Dict] = {}
        self._initialized = True
    
    def create_game(self, player1_name: str, player2_name: str) -> Dict[str, Any]:
        """創建新遊戲"""
        game_data = self.game_init_service.initialize_new_game(player1_name, player2_name)
        game_id = game_data["game_id"]
        
        # 生成創建者token
        import secrets
        creator_token = secrets.token_urlsafe(16)
        
        # 保存到內存
        self._games[game_id] = game_data
        self._game_sessions[game_id] = {
            'creator_token': creator_token,
            'creator_player_id': list(game_data["players"].keys())[0],
            'created_at': datetime.now().isoformat()
        }
        
        # 在返回數據中包含creator_token
        game_data['creator_token'] = creator_token
        
        print(f"✅ 遊戲 {game_id} 已創建，創建者token: {creator_token}")
        
        return game_data
    
    def get_game_state(self, game_id: str, creator_token: str = None) -> Dict[str, Any]:
        """獲取遊戲狀態"""
        # 從內存載入
        game_state = self._games.get(game_id)
        if not game_state:
            raise ValueError("遊戲不存在")
            
        # 獲取會話信息
        session_info = self._game_sessions.get(game_id, {})
        player_ids = list(game_state['players'].keys())
        
        # 根據creator_token決定玩家身份
        if creator_token and creator_token == session_info.get('creator_token'):
            # 是創建者，分配為第一個玩家
            assigned_player_id = player_ids[0]
            player_role = 'creator'
            print(f"✅ 創建者身份確認: token匹配，分配為player1")
        else:
            # 不是創建者，分配為第二個玩家
            if len(player_ids) >= 2:
                assigned_player_id = player_ids[1]
                player_role = 'joiner'
                print(f"✅ 加入者身份確認: 無token或token不匹配，分配為player2")
            else:
                # 如果只有一個玩家但不是創建者，說明可能有問題
                print(f"⚠️ 警告: 遊戲只有一個玩家但請求者不是創建者")
                assigned_player_id = player_ids[0]
                player_role = 'unknown'
        
        # 添加玩家身份信息到響應中
        response_data = game_state.copy()
        response_data['player_assignment'] = {
            'assigned_player_id': assigned_player_id,
            'player_role': player_role,
            'is_creator': player_role == 'creator'
        }
        
        print(f"🔍 玩家身份分配: 遊戲{game_id}, token={creator_token[:8] if creator_token else 'None'}..., 角色={player_role}, 玩家ID={assigned_player_id}")
        
        return response_data
    
    def execute_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行遊戲動作"""
        # 檢查遊戲是否存在
        if game_id not in self._games:
            raise ValueError("遊戲不存在")
        
        game_state = self._games[game_id]
        print(f"執行動作: 遊戲 {game_id}, 動作類型: {action.action_type}, 卡牌: {action.card_ids}")
        
        # 驗證是否為當前玩家
        if action.player_id != game_state["current_player_id"]:
            raise ValueError("不是當前玩家的回合")
        
        # 驗證動作有效性
        try:
            self._validate_action(game_id, action)
        except ValueError as e:
            print(f"動作驗證失敗: {str(e)}")
            raise e
        
        # 執行動作後切換回合
        self._switch_turn(game_state)
        
        # 更新遊戲狀態
        self._games[game_id] = game_state
        
        return game_state
    
    def get_game_status(self, game_id: str) -> Optional[Dict[str, Any]]:
        """獲取遊戲簡要狀態"""
        if game_id not in self._games:
            return None
            
        game_state = self._games[game_id]
        return {
            "game_id": game_id,
            "status": game_state.get("status", "PLAYING"),
            "current_player_id": game_state.get("current_player_id"),
            "round_number": game_state.get("round_number", 1),
            "player_names": [player["name"] for player in game_state["players"].values()],
            "created_at": datetime.now().isoformat(),
            "winner": game_state.get("winner")
        }
    
    def reset_game(self, game_id: str) -> Dict[str, Any]:
        """重置遊戲"""
        if game_id not in self._games:
            raise ValueError("遊戲不存在")
        
        # TODO: 實現遊戲重置邏輯
        return self._create_mock_game_state(game_id)
    
    def delete_game(self, game_id: str) -> bool:
        """刪除遊戲"""
        if self.use_mongodb:
            return self.mongodb_service.delete_game(game_id)
        else:
            if game_id in self._games:
                del self._games[game_id]
                return True
            return False
    
    def list_games(self) -> List[Dict[str, Any]]:
        """列出所有遊戲"""
        if self.use_mongodb:
            return self.mongodb_service.list_games()
        else:
            # 內存版本
            return [
                {
                    "game_id": game_id,
                    "status": "PLAYING",
                    "player_names": ["玩家1", "玩家2"],
                    "created_at": datetime.now().isoformat(),
                    "current_round": 1
                }
                for game_id in self._games.keys()
            ]
    
    def _validate_action(self, game_id: str, action: ActionRequest) -> None:
        """驗證動作有效性"""
        # TODO: 實現動作驗證邏輯
        if not action.card_ids:
            raise ValueError("必須選擇至少一張卡牌")
        
        # 根據動作類型驗證
        if action.action_type == ActionType.SECRET and len(action.card_ids) != 1:
            raise ValueError("秘密保留必須選擇1張卡牌")
        elif action.action_type == ActionType.DISCARD and len(action.card_ids) != 2:
            raise ValueError("棄牌必須選擇2張卡牌")
        elif action.action_type == ActionType.GIFT and len(action.card_ids) != 3:
            raise ValueError("獻禮必須選擇3張卡牌")
        elif action.action_type == ActionType.COMPETE and len(action.card_ids) != 4:
            raise ValueError("競爭必須選擇4張卡牌")
    
    def _execute_game_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行具體的遊戲動作"""
        # TODO: 實現具體的遊戲邏輯
        
        # 根據動作類型執行不同邏輯
        if action.action_type == ActionType.SECRET:
            return self._execute_secret_action(game_id, action)
        elif action.action_type == ActionType.DISCARD:
            return self._execute_discard_action(game_id, action)
        elif action.action_type == ActionType.GIFT:
            return self._execute_gift_action(game_id, action)
        elif action.action_type == ActionType.COMPETE:
            return self._execute_compete_action(game_id, action)
        
        raise ValueError(f"未知的動作類型: {action.action_type}")
    
    def _switch_turn(self, game_state: Dict[str, Any]) -> None:
        """切換回合"""
        current_player_id = game_state["current_player_id"]
        players = game_state["players"]
        
        # 找到另一個玩家
        other_player_id = None
        for player_id in players.keys():
            if player_id != current_player_id:
                other_player_id = player_id
                break
        
        if other_player_id:
            # 切換當前玩家
            game_state["current_player_id"] = other_player_id
            
            # 更新玩家的is_current_player狀態
            players[current_player_id]["is_current_player"] = False
            players[other_player_id]["is_current_player"] = True
            
            print(f"回合已切換: {current_player_id} -> {other_player_id}")
    
    def _execute_secret_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行秘密保留動作"""
        # TODO: 實現秘密保留邏輯
        return self._create_mock_game_state(game_id)
    
    def _execute_discard_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行棄牌動作"""
        # TODO: 實現棄牌邏輯
        return self._create_mock_game_state(game_id)
    
    def _execute_gift_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行獻禮動作"""
        # TODO: 實現獻禮邏輯
        return self._create_mock_game_state(game_id)
    
    def _execute_compete_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行競爭動作"""
        # TODO: 實現競爭邏輯
        return self._create_mock_game_state(game_id)
    
    def _create_mock_game_state(self, game_id: str) -> Dict[str, Any]:
        """創建模擬的遊戲狀態"""
        # 檢查是否已有遊戲狀態
        if game_id in self._games:
            return self._games[game_id]
            
        return {
            "game_id": game_id,
            "status": "PLAYING",
            "current_player_id": "player1",
            "round_number": 1,
            "players": {
                "player1": {
                    "id": "player1",
                    "name": "玩家1",
                    "hand_cards": [],
                    "used_actions": [],
                    "secret_cards": [],
                    "allocated_gifts": {},
                    "score": 0,
                    "is_current_player": True
                },
                "player2": {
                    "id": "player2", 
                    "name": "玩家2",
                    "hand_cards": [],
                    "used_actions": [],
                    "secret_cards": [],
                    "allocated_gifts": {},
                    "score": 0,
                    "is_current_player": False
                }
            },
            "geishas": [],
            "messages": [],
            "winner": None
        }