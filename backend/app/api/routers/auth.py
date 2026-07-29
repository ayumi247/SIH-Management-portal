from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from starlette.concurrency import run_in_threadpool
from app.core.db import get_session
from app.models.domain import Users
from app.schemas.requests import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.post("/register")
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = Users(
        name=user_data.name, 
        email=user_data.email, 
        password_hash=hashed_password,
        gender=user_data.gender,
        college_id=user_data.college_id,
        github_url=user_data.github_url,
        linkedin_url=user_data.linkedin_url
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if not user or not user.password_hash or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

from app.api.deps import get_current_user
from app.models.domain import TeamMembers

@router.get("/me")
def get_me(current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    from app.models.domain import Teams
    team_member = session.exec(select(TeamMembers).where(TeamMembers.user_id == current_user.id)).first()
    is_leader = False
    if team_member:
        team = session.get(Teams, team_member.team_id)
        if team and team.leader_id == current_user.id:
            is_leader = True
            
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "github_url": current_user.github_url,
        "linkedin_url": current_user.linkedin_url,
        "skills": current_user.skills,
        "study_year": current_user.study_year,
        "team_id": team_member.team_id if team_member else None,
        "is_leader": is_leader
    }


from typing import List, Optional
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    skills: Optional[List[str]] = None
    study_year: Optional[int] = None
    college_id: Optional[str] = None

@router.put("/profile")
def update_profile(update_data: ProfileUpdate, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    if update_data.github_url is not None: current_user.github_url = update_data.github_url
    if update_data.linkedin_url is not None: current_user.linkedin_url = update_data.linkedin_url
    if update_data.skills is not None: current_user.skills = update_data.skills
    if update_data.study_year is not None: current_user.study_year = update_data.study_year
    if update_data.college_id is not None: current_user.college_id = update_data.college_id
    
    session.add(current_user)
    session.commit()
    return {"message": "Profile updated"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, session: Session = Depends(get_session)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        raise HTTPException(status_code=400, detail="Google authentication failed or credentials missing")
    
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not fetch user info")
        
    email = user_info.get("email")
    name = user_info.get("name")
    
    def process_google_user():
        u = session.exec(select(Users).where(Users.email == email)).first()
        if not u:
            u = Users(name=name, email=email, oauth_provider="google")
            session.add(u)
            session.commit()
            session.refresh(u)
        return u
        
    user = await run_in_threadpool(process_google_user)
        
    access_token = create_access_token(subject=str(user.id))
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}")
