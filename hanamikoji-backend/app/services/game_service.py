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
    
    def __init__(self, db: Session):
        self.db = db
        self.game_init_service = GameInitializationService()
        
        # 初始化MongoDB並設置儲存服務
        self.use_mongodb = init_mongodb()
        if self.use_mongodb:
            self.mongodb_service = MongoDBGameService()
        else:
            # 使用內存存儲作為備用
            self._games: Dict[str, Game] = {}
    
    def create_game(self, player1_name: str, player2_name: str) -> Dict[str, Any]:
        """創建新遊戲"""
        game_data = self.game_init_service.initialize_new_game(player1_name, player2_name)
        game_id = game_data["game_id"]
        
        if self.use_mongodb:
            # 從工廠創建Game實體然後保存到MongoDB
            game_entity = self.game_init_service.game_factory.create_new_game(player1_name, player2_name)
            success = self.mongodb_service.save_game(game_entity)
            if not success:
                print(f"⚠️  MongoDB保存失敗，遊戲 {game_id} 僅存在於內存中")
        
        return game_data
    
    def get_game_state(self, game_id: str) -> Optional[Dict[str, Any]]:
        """獲取遊戲狀態"""
        if self.use_mongodb:
            return self.mongodb_service.load_game(game_id)
        else:
            # 從內存載入（備用方案）
            if game_id not in self._games:
                return None
            return self._create_mock_game_state(game_id)
    
    def execute_action(self, game_id: str, action: ActionRequest) -> Dict[str, Any]:
        """執行遊戲動作"""
        # 檢查遊戲是否存在
        if self.use_mongodb:
            game_state = self.mongodb_service.load_game(game_id)
            if not game_state:
                raise ValueError("遊戲不存在")
        else:
            if game_id not in self._games:
                raise ValueError("遊戲不存在")
        
        # 驗證動作有效性
        self._validate_action(game_id, action)
        
        # 執行動作
        result = self._execute_game_action(game_id, action)
        
        # 保存動作記錄
        if self.use_mongodb:
            self.mongodb_service.save_action(game_id, action, result)
        
        return result
    
    def get_game_status(self, game_id: str) -> Optional[Dict[str, Any]]:
        """獲取遊戲簡要狀態"""
        # TODO: 從資料庫獲取
        if game_id not in self._games:
            return None
            
        return {
            "game_id": game_id,
            "status": "PLAYING",
            "current_player_id": "player1",
            "round_number": 1,
            "player_names": ["玩家1", "玩家2"],
            "created_at": datetime.now().isoformat(),
            "winner": None
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