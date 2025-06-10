"""FastAPI版本的遊戲初始化服務"""

from fastapi import HTTPException
from typing import Dict
from app.domain.factories.game_factory import GameInitializationService as DomainGameInit


class GameApplicationService:
    """遊戲應用服務"""

    def __init__(self):
        self.domain_service = DomainGameInit()

    async def create_new_game(self, player1_name: str, player2_name: str) -> Dict:
        """創建新遊戲 (API版本)"""
        try:
            game_state = self.domain_service.initialize_new_game(player1_name, player2_name)
            return {
                "success": True,
                "message": "遊戲創建成功",
                "data": game_state
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"遊戲創建失敗: {str(e)}")

    async def validate_system(self) -> Dict:
        """驗證系統狀態"""
        validation = self.domain_service.validate_game_data()

        if validation.get("error"):
            raise HTTPException(status_code=500, detail=validation["error"])

        return {
            "success": True,
            "message": "系統驗證完成",
            "data": validation
        }