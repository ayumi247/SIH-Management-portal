from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlmodel import Session, select
from typing import Optional, Dict, List
from uuid import UUID
import json
from jose import jwt, JWTError

from app.core.db import get_session
from app.core.config import settings
from app.models.domain import Users, Teams, TeamMembers, Messages

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

class ConnectionManager:
    def __init__(self):
        # Maps team_id to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, team_id: str):
        await websocket.accept()
        if team_id not in self.active_connections:
            self.active_connections[team_id] = []
        self.active_connections[team_id].append(websocket)

    def disconnect(self, websocket: WebSocket, team_id: str):
        if team_id in self.active_connections:
            if websocket in self.active_connections[team_id]:
                self.active_connections[team_id].remove(websocket)
            if not self.active_connections[team_id]:
                del self.active_connections[team_id]

    async def broadcast(self, message: str, team_id: str):
        if team_id in self.active_connections:
            for connection in self.active_connections[team_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()

async def get_user_from_token(token: str, session: Session) -> Optional[Users]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = session.get(Users, user_id)
        return user
    except JWTError:
        return None

@router.websocket("/team/{team_id}")
async def websocket_chat(
    websocket: WebSocket,
    team_id: UUID,
    token: str = Query(...),
    session: Session = Depends(get_session)
):
    # Authenticate before accepting
    user = await get_user_from_token(token, session)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return
        
    # Check if user is in team
    team_member = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id, TeamMembers.user_id == user.id)).first()
    team = session.get(Teams, team_id)
    if not team_member and (team and team.leader_id != user.id):
        await websocket.close(code=4003, reason="Forbidden")
        return

    team_id_str = str(team_id)
    await manager.connect(websocket, team_id_str)
    
    try:
        while True:
            # Receive from WebSocket
            data = await websocket.receive_text()
            
            # Save message to database
            new_message = Messages(team_id=team_id, sender_id=user.id, content=data)
            session.add(new_message)
            session.commit()
            
            # Publish to all connected clients in the team
            payload = json.dumps({
                "sender_id": str(user.id),
                "sender_name": user.name,
                "content": data,
                "timestamp": new_message.timestamp.isoformat()
            })
            await manager.broadcast(payload, team_id_str)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, team_id_str)
