"""遊戲相關的API路由"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid

from app.database.connection import get_db
from app.domain.factories.game_factory import GameInitializationService
from app.schemas.game import (
    GameCreateRequest, 
    GameStateResponse, 
    ActionRequest,
    GameStatusResponse
)
from app.services.game_service import GameService

router = APIRouter()


@router.post("/create", response_model=GameStateResponse)
async def create_game(
    request: GameCreateRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """創建新遊戲"""
    try:
        service = GameInitializationService()
        game_data = service.initialize_new_game(
            request.player1_name, 
            request.player2_name
        )
        
        # 保存到資料庫的邏輯可以在這裡添加
        
        return game_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"創建遊戲失敗: {str(e)}")


@router.get("/{game_id}", response_model=GameStateResponse)
async def get_game_state(
    game_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """獲取遊戲狀態"""
    try:
        game_service = GameService(db)
        game_state = game_service.get_game_state(game_id)
        
        if not game_state:
            raise HTTPException(status_code=404, detail="遊戲未找到")
        
        return game_state
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取遊戲狀態失敗: {str(e)}")


@router.post("/{game_id}/action")
async def execute_action(
    game_id: str,
    action: ActionRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """執行遊戲動作"""
    try:
        game_service = GameService(db)
        result = game_service.execute_action(game_id, action)
        
        return {
            "success": True,
            "message": "動作執行成功",
            "game_state": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"執行動作失敗: {str(e)}")


@router.get("/{game_id}/status", response_model=GameStatusResponse)
async def get_game_status(
    game_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """獲取遊戲簡要狀態"""
    try:
        game_service = GameService(db)
        status = game_service.get_game_status(game_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="遊戲未找到")
        
        return status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取遊戲狀態失敗: {str(e)}")


@router.post("/{game_id}/reset")
async def reset_game(
    game_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """重置遊戲"""
    try:
        game_service = GameService(db)
        result = game_service.reset_game(game_id)
        
        return {
            "success": True,
            "message": "遊戲重置成功",
            "game_state": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重置遊戲失敗: {str(e)}")


@router.delete("/{game_id}")
async def delete_game(
    game_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """刪除遊戲"""
    try:
        game_service = GameService(db)
        success = game_service.delete_game(game_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="遊戲未找到")
        
        return {
            "success": True,
            "message": "遊戲刪除成功"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刪除遊戲失敗: {str(e)}")


@router.get("/")
async def list_games(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """列出所有遊戲"""
    try:
        game_service = GameService(db)
        games = game_service.list_games()
        
        return {
            "games": games,
            "total": len(games)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取遊戲列表失敗: {str(e)}")