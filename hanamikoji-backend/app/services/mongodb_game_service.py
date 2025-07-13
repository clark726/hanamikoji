"""MongoDB遊戲儲存服務"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import mongodb, Collections
from app.models.mongodb import (
    GameDocument, PlayerDocument, GiftCardDocument, GeishaDocument,
    GameActionDocument, GameMessageDocument, GameStateSnapshot
)
from app.domain.entities.game import Game
from app.domain.entities.user import Player
from app.domain.entities.card import GiftCard, Geisha
from app.schemas.game import ActionRequest


class MongoDBGameService:
    """MongoDB遊戲儲存服務"""
    
    def __init__(self):
        self.games_collection = mongodb.get_collection(Collections.GAMES)
        self.players_collection = mongodb.get_collection(Collections.PLAYERS)
        self.cards_collection = mongodb.get_collection(Collections.CARDS)
        self.geishas_collection = mongodb.get_collection(Collections.GEISHAS)
        self.actions_collection = mongodb.get_collection("game_actions")
        self.messages_collection = mongodb.get_collection("game_messages")
        self.snapshots_collection = mongodb.get_collection("game_snapshots")
    
    def save_game(self, game: Game) -> bool:
        """保存完整遊戲狀態到MongoDB"""
        try:
            # 保存遊戲主文檔
            game_doc = GameDocument(
                game_id=game.game_id,
                status="PLAYING",
                current_player_id=game.current_player.id,
                round_number=game.round_number,
                player_ids=[game.player1.id, game.player2.id],
                geisha_ids=[g.id for g in game.geishas],
                all_card_ids=[c.card_id for c in game.all_cards]
            )
            
            # 使用upsert來避免重複
            self.games_collection.replace_one(
                {"game_id": game.game_id},
                game_doc.dict(by_alias=True, exclude={"id"}),
                upsert=True
            )
            
            # 保存玩家
            self._save_players(game)
            
            # 保存卡牌
            self._save_cards(game)
            
            # 保存藝妓
            self._save_geishas(game)
            
            print(f"✅ 遊戲 {game.game_id} 保存成功")
            return True
            
        except Exception as e:
            print(f"❌ 保存遊戲失敗: {e}")
            return False
    
    def _save_players(self, game: Game):
        """保存玩家資料"""
        for player in [game.player1, game.player2]:
            player_doc = PlayerDocument(
                player_id=player.id,
                name=player.name,
                game_id=game.game_id,
                hand_card_ids=[c.card_id for c in player.hand_cards],
                is_current_player=(player == game.current_player),
                updated_at=datetime.now()
            )
            
            self.players_collection.replace_one(
                {"player_id": player.id, "game_id": game.game_id},
                player_doc.dict(by_alias=True, exclude={"id"}),
                upsert=True
            )
    
    def _save_cards(self, game: Game):
        """保存卡牌資料"""
        for card in game.all_cards:
            card_doc = GiftCardDocument(
                card_id=card.card_id,
                geisha_id=card.geisha_id,
                item_name=card.item_name,
                charm_value=card.charm_value,
                status=card.status.value,
                owner_id=card.owner_name,
                game_id=game.game_id
            )
            
            self.cards_collection.replace_one(
                {"card_id": card.card_id},
                card_doc.dict(by_alias=True, exclude={"id"}),
                upsert=True
            )
    
    def _save_geishas(self, game: Game):
        """保存藝妓資料"""
        for geisha in game.geishas:
            geisha_doc = GeishaDocument(
                geisha_id=geisha.id,
                name=geisha.name,
                charm=geisha.charm,
                gift_item=geisha.gift_item,
                description=geisha.description,
                game_id=game.game_id
            )
            
            self.geishas_collection.replace_one(
                {"geisha_id": geisha.id, "game_id": game.game_id},
                geisha_doc.dict(by_alias=True, exclude={"id"}),
                upsert=True
            )
    
    def load_game(self, game_id: str) -> Optional[Dict[str, Any]]:
        """從MongoDB載入遊戲狀態"""
        try:
            # 載入遊戲主文檔
            game_doc = self.games_collection.find_one({"game_id": game_id})
            if not game_doc:
                return None
            
            # 載入玩家
            players = {}
            for player_id in game_doc["player_ids"]:
                player_doc = self.players_collection.find_one({
                    "player_id": player_id,
                    "game_id": game_id
                })
                if player_doc:
                    # 載入玩家手牌
                    hand_cards = list(self.cards_collection.find({
                        "card_id": {"$in": player_doc["hand_card_ids"]}
                    }))
                    
                    players[player_id] = {
                        "id": player_doc["player_id"],
                        "name": player_doc["name"],
                        "hand_cards": [self._card_doc_to_dict(card) for card in hand_cards],
                        "used_actions": player_doc.get("used_actions", []),
                        "secret_cards": [],
                        "allocated_gifts": player_doc.get("allocated_gift_ids", {}),
                        "score": player_doc.get("score", 0),
                        "is_current_player": player_doc.get("is_current_player", False)
                    }
            
            # 載入藝妓
            geishas = []
            for geisha_id in game_doc["geisha_ids"]:
                geisha_doc = self.geishas_collection.find_one({
                    "geisha_id": geisha_id,
                    "game_id": game_id
                })
                if geisha_doc:
                    geishas.append({
                        "id": geisha_doc["geisha_id"],
                        "name": geisha_doc["name"],
                        "charm": geisha_doc["charm"],
                        "gift_item": geisha_doc["gift_item"],
                        "description": geisha_doc.get("description"),
                        "favor": geisha_doc.get("favor", "NEUTRAL"),
                        "allocated_gifts": geisha_doc.get("allocated_gifts", {})
                    })
            
            # 載入訊息
            messages = list(self.messages_collection.find(
                {"game_id": game_id}
            ).sort("timestamp", 1))
            
            return {
                "game_id": game_doc["game_id"],
                "status": game_doc["status"],
                "current_player_id": game_doc["current_player_id"],
                "round_number": game_doc["round_number"],
                "players": players,
                "geishas": geishas,
                "messages": [self._message_doc_to_dict(msg) for msg in messages],
                "winner": game_doc.get("winner")
            }
            
        except Exception as e:
            print(f"❌ 載入遊戲失敗: {e}")
            return None
    
    def save_action(self, game_id: str, action: ActionRequest, result: Dict[str, Any]) -> bool:
        """保存遊戲動作"""
        try:
            action_doc = GameActionDocument(
                action_id=str(uuid.uuid4()),
                game_id=game_id,
                player_id=action.player_id,
                action_type=action.action_type.value,
                card_ids=action.card_ids,
                target_geisha_id=action.target_geisha_id,
                groupings=action.groupings,
                result=result,
                round_number=result.get("round_number", 1),
                action_sequence=self._get_next_action_sequence(game_id, result.get("round_number", 1))
            )
            
            self.actions_collection.insert_one(
                action_doc.dict(by_alias=True, exclude={"id"})
            )
            
            return True
        except Exception as e:
            print(f"❌ 保存動作失敗: {e}")
            return False
    
    def save_message(self, game_id: str, message: Dict[str, Any]) -> bool:
        """保存遊戲訊息"""
        try:
            message_doc = GameMessageDocument(
                message_id=message["id"],
                game_id=game_id,
                type=message["type"],
                text=message["text"],
                timestamp=message["timestamp"],
                player_id=message.get("player_id"),
                player_name=message.get("player_name"),
                action_type=message.get("action_type"),
                details=message.get("details", {})
            )
            
            self.messages_collection.insert_one(
                message_doc.dict(by_alias=True, exclude={"id"})
            )
            
            return True
        except Exception as e:
            print(f"❌ 保存訊息失敗: {e}")
            return False
    
    def create_snapshot(self, game_id: str, game_state: Dict[str, Any], snapshot_type: str = "auto") -> bool:
        """創建遊戲狀態快照"""
        try:
            snapshot_doc = GameStateSnapshot(
                snapshot_id=str(uuid.uuid4()),
                game_id=game_id,
                round_number=game_state.get("round_number", 1),
                current_player_id=game_state.get("current_player_id"),
                game_state=game_state,
                snapshot_type=snapshot_type
            )
            
            self.snapshots_collection.insert_one(
                snapshot_doc.dict(by_alias=True, exclude={"id"})
            )
            
            return True
        except Exception as e:
            print(f"❌ 創建快照失敗: {e}")
            return False
    
    def list_games(self, limit: int = 50) -> List[Dict[str, Any]]:
        """列出遊戲"""
        try:
            games = list(self.games_collection.find().sort("created_at", -1).limit(limit))
            result = []
            
            for game in games:
                # 獲取玩家名稱
                player_names = []
                for player_id in game.get("player_ids", []):
                    player = self.players_collection.find_one({"player_id": player_id})
                    if player:
                        player_names.append(player["name"])
                
                result.append({
                    "game_id": game["game_id"],
                    "status": game["status"],
                    "player_names": player_names,
                    "created_at": game["created_at"].isoformat(),
                    "current_round": game["round_number"]
                })
            
            return result
        except Exception as e:
            print(f"❌ 列出遊戲失敗: {e}")
            return []
    
    def delete_game(self, game_id: str) -> bool:
        """刪除遊戲"""
        try:
            # 刪除所有相關文檔
            self.games_collection.delete_one({"game_id": game_id})
            self.players_collection.delete_many({"game_id": game_id})
            self.cards_collection.delete_many({"game_id": game_id})
            self.geishas_collection.delete_many({"game_id": game_id})
            self.actions_collection.delete_many({"game_id": game_id})
            self.messages_collection.delete_many({"game_id": game_id})
            self.snapshots_collection.delete_many({"game_id": game_id})
            
            print(f"✅ 遊戲 {game_id} 刪除成功")
            return True
        except Exception as e:
            print(f"❌ 刪除遊戲失敗: {e}")
            return False
    
    def _get_next_action_sequence(self, game_id: str, round_number: int) -> int:
        """獲取下一個動作序號"""
        last_action = self.actions_collection.find_one(
            {"game_id": game_id, "round_number": round_number},
            sort=[("action_sequence", -1)]
        )
        return (last_action["action_sequence"] + 1) if last_action else 1
    
    def _card_doc_to_dict(self, card_doc: Dict) -> Dict[str, Any]:
        """將卡牌文檔轉為字典"""
        return {
            "id": card_doc["card_id"],
            "geisha_id": card_doc["geisha_id"],
            "item_name": card_doc["item_name"],
            "charm_value": card_doc["charm_value"],
            "status": card_doc["status"],
            "owner_id": card_doc.get("owner_id")
        }
    
    def _message_doc_to_dict(self, message_doc: Dict) -> Dict[str, Any]:
        """將訊息文檔轉為字典"""
        return {
            "id": message_doc["message_id"],
            "type": message_doc["type"],
            "text": message_doc["text"],
            "timestamp": message_doc["timestamp"],
            "player_id": message_doc.get("player_id"),
            "player_name": message_doc.get("player_name"),
            "action_type": message_doc.get("action_type"),
            "details": message_doc.get("details", {})
        }
    
    def get_game_statistics(self, game_id: str) -> Dict[str, Any]:
        """獲取遊戲統計"""
        try:
            actions_count = self.actions_collection.count_documents({"game_id": game_id})
            messages_count = self.messages_collection.count_documents({"game_id": game_id})
            snapshots_count = self.snapshots_collection.count_documents({"game_id": game_id})
            
            return {
                "game_id": game_id,
                "total_actions": actions_count,
                "total_messages": messages_count,
                "total_snapshots": snapshots_count
            }
        except Exception as e:
            print(f"❌ 獲取統計失敗: {e}")
            return {}