"""房間相關的API路由"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.schemas.room import (
    JoinRoomRequest,
    LeaveRoomRequest, 
    RoomResponse,
    RoomListResponse,
    LeaveRoomResponse,
    ErrorResponse,
    RoomStatus
)
from app.services.room_service import RoomService
from app.database.connection import get_db

router = APIRouter()
room_service: Optional[RoomService] = None

def get_room_service(db: Session = Depends(get_db)) -> RoomService:
    global room_service
    if room_service is None:
        room_service = RoomService(db)
    return room_service


@router.post("/join", response_model=RoomResponse)
async def join_room(request: JoinRoomRequest, room_service: RoomService = Depends(get_room_service)) -> Dict[str, Any]:
    """加入房間 - 自動分配可用房間或創建新房間"""
    try:
        result = room_service.join_room(
            player_name=request.player_name,
            player_id=request.player_id
        )
        
        # 檢查是否有錯誤
        if "error" in result:
            status_code = {
                "PlayerAlreadyInRoom": 409,
                "RoomFull": 422,
            }.get(result["error"], 400)
            
            raise HTTPException(
                status_code=status_code,
                detail=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail={
                "error": "InternalServerError",
                "message": f"加入房間失敗: {str(e)}"
            }
        )


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, room_service: RoomService = Depends(get_room_service)) -> Dict[str, Any]:
    """獲取房間詳細資訊"""
    try:
        room = room_service.get_room(room_id)
        
        if not room:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "RoomNotFound",
                    "message": "房間不存在"
                }
            )
        
        return room.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError", 
                "message": f"獲取房間失敗: {str(e)}"
            }
        )


@router.delete("/{room_id}/players/{player_id}", response_model=LeaveRoomResponse)
async def leave_room(
    room_id: str, 
    player_id: str, 
    reason: Optional[str] = None
) -> Dict[str, Any]:
    """離開房間"""
    try:
        result = room_service.leave_room(
            room_id=room_id,
            player_id=player_id,
            reason=reason
        )
        
        # 檢查是否有錯誤
        if "error" in result:
            status_code = {
                "RoomNotFound": 404,
                "PlayerNotInRoom": 409,
                "InvalidOperation": 422,
            }.get(result["error"], 400)
            
            raise HTTPException(
                status_code=status_code,
                detail=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"離開房間失敗: {str(e)}"
            }
        )


@router.get("/", response_model=RoomListResponse)
async def get_room_list(
    status: Optional[RoomStatus] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """獲取房間列表"""
    try:
        # 轉換枚舉為字符串
        status_str = status.value if status else None
        
        result = room_service.get_room_list(
            status=status_str,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"獲取房間列表失敗: {str(e)}"
            }
        )


@router.get("/players/{player_id}/room", response_model=RoomResponse)
async def get_player_room(player_id: str) -> Dict[str, Any]:
    """獲取玩家當前所在房間"""
    try:
        room = room_service.find_player_room(player_id)
        
        if not room:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "PlayerNotInRoom",
                    "message": "玩家不在任何房間中"
                }
            )
        
        return room.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"查找玩家房間失敗: {str(e)}"
            }
        )


@router.post("/{room_id}/start", response_model=RoomResponse)
async def start_game_in_room(room_id: str) -> Dict[str, Any]:
    """在房間中開始遊戲（手動觸發）"""
    try:
        room = room_service.get_room(room_id)
        
        if not room:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "RoomNotFound",
                    "message": "房間不存在"
                }
            )
        
        if not room.can_start_game():
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "InvalidOperation",
                    "message": "房間無法開始遊戲",
                    "details": {
                        "current_status": room.status,
                        "player_count": len(room.players),
                        "required_players": room.max_players
                    }
                }
            )
        
        # TODO: 整合遊戲創建服務
        # 目前暫時使用臨時的game_id
        import uuid
        game_id = f"game_{uuid.uuid4().hex[:8]}"
        
        success = room_service.start_game_in_room(room_id, game_id)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "InternalServerError",
                    "message": "開始遊戲失敗"
                }
            )
        
        # 重新獲取更新後的房間
        updated_room = room_service.get_room(room_id)
        result = updated_room.to_dict()
        result["message"] = "遊戲已開始"
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"開始遊戲失敗: {str(e)}"
            }
        )