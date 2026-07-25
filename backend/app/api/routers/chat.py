from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
import json
import asyncio
from jose import jwt, JWTError

from app.core.db import get_session
from app.core.config import settings
from app.core.redis import get_redis
from app.models.domain import Users, Teams, TeamMembers, Messages

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

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
    session: Session = Depends(get_session),
    redis = Depends(get_redis)
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

    await websocket.accept()
    
    channel_name = f"team:{team_id}"
    pubsub = redis.pubsub()
    await pubsub.subscribe(channel_name)
    
    # Task to listen to Redis and send to WebSocket
    async def redis_listener():
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    await websocket.send_text(data)
        except asyncio.CancelledError:
            await pubsub.unsubscribe(channel_name)

    listener_task = asyncio.create_task(redis_listener())

    try:
        while True:
            # Receive from WebSocket
            data = await websocket.receive_text()
            
            # Save message to database
            new_message = Messages(team_id=team_id, sender_id=user.id, content=data)
            session.add(new_message)
            session.commit()
            
            # Publish to Redis
            payload = json.dumps({
                "sender_id": str(user.id),
                "sender_name": user.name,
                "content": data,
                "timestamp": new_message.timestamp.isoformat()
            })
            await redis.publish(channel_name, payload)
            
    except WebSocketDisconnect:
        listener_task.cancel()
        await pubsub.unsubscribe(channel_name)
