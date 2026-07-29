from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from uuid import UUID
from app.core.db import get_session
from app.models.domain import Teams, Colleges, Users, JoinRequests, TeamMembers
from app.schemas.requests import TeamCreate, JoinRequestUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("")
def create_team(team: TeamCreate, background_tasks: BackgroundTasks, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    # Single Team Lock (Leader)
    if session.exec(select(TeamMembers).where(TeamMembers.user_id == current_user.id)).first():
        raise HTTPException(status_code=400, detail="The Single Team Lock: You are already in a team.")
        
    existing = session.exec(select(Teams).where(Teams.name == team.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")
        
    if current_user.college_id:
        college = session.get(Colleges, current_user.college_id)
        if college and college.name.lower() in team.name.lower():
            raise HTTPException(status_code=400, detail="Team name cannot contain the college name")
    else:
        raise HTTPException(status_code=400, detail="You must update your profile and select a college before creating a team.")

    if len(team.members) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 additional members can be invited at creation.")
        
    if team.members:
        # Diversity Lock Check (Temporarily Disabled)
        # has_female = (current_user.gender and current_user.gender.lower() == 'female') or \
        #              any(m.gender.lower() == 'female' for m in team.members)
        # if not has_female:
        #     raise HTTPException(status_code=400, detail="The Diversity Lock: Team must include at least one female member.")

        # Strict College Lock & Single Team Lock for invited members
        for m in team.members:
            existing_user = session.exec(select(Users).where(Users.email == m.email)).first()
            if existing_user:
                if existing_user.college_id != current_user.college_id:
                    raise HTTPException(status_code=400, detail=f"Strict College Lock: {m.email} belongs to a different college.")
                if session.exec(select(TeamMembers).where(TeamMembers.user_id == existing_user.id)).first():
                    raise HTTPException(status_code=400, detail=f"Single Team Lock: {m.email} is already in a team.")

    new_team = Teams(
        name=team.name,
        hackathon_id=team.hackathon_id,
        college_id=current_user.college_id,
        leader_id=current_user.id,
        problem_statement=team.problem_statement,
        required_skills=team.required_skills
    )
    session.add(new_team)
    session.commit()
    session.refresh(new_team)
    
    # Add leader
    session.add(TeamMembers(team_id=new_team.id, user_id=current_user.id))
    
    # Add invited members
    for m in team.members:
        existing_user = session.exec(select(Users).where(Users.email == m.email)).first()
        if not existing_user:
            existing_user = Users(name=m.name, email=m.email, gender=m.gender, college_id=current_user.college_id)
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
            
        session.add(TeamMembers(team_id=new_team.id, user_id=existing_user.id))
        
        # Send Email Notification
        from app.core.email import send_email_notification
        subject = f"You've been added to team {new_team.name}!"
        body = f"Hello {existing_user.name},\n\nYou have been added to the team {new_team.name} by {current_user.name} for the SIH Matchmaker. Log in to check your team hub!"
        background_tasks.add_task(send_email_notification, existing_user.email, subject, body)
        
    session.commit()
    return new_team

@router.post("/{team_id}/requests")
def request_to_join(team_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    if session.exec(select(TeamMembers).where(TeamMembers.user_id == current_user.id)).first():
        raise HTTPException(status_code=400, detail="The Single Team Lock: You are already in a team.")
        
    team = session.get(Teams, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.college_id != current_user.college_id:
        raise HTTPException(status_code=403, detail="The College Lock: You must be from the same college")
        
    existing_req = session.exec(select(JoinRequests).where(JoinRequests.team_id == team_id, JoinRequests.user_id == current_user.id)).first()
    if existing_req:
        raise HTTPException(status_code=400, detail="Request already exists")
        
    req = JoinRequests(team_id=team_id, user_id=current_user.id, requested_by="User")
    session.add(req)
    session.commit()
    return {"message": "Request sent"}

@router.get("/{team_id}")
def get_team(team_id: UUID, session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    members = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id)).all()
    user_ids = [m.user_id for m in members]
    users = session.exec(select(Users).where(Users.id.in_(user_ids))).all()
    
    # attach is_team_leader flag
    member_data = []
    for u in users:
        member_data.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "gender": u.gender,
            "is_team_leader": u.id == team.leader_id
        })
        
    return {
        "id": team.id,
        "name": team.name,
        "leader_id": team.leader_id,
        "created_at": team.created_at,
        "is_recruiting": team.is_recruiting,
        "required_skills": team.required_skills,
        "problem_statement": team.problem_statement,
        "members": member_data
    }

@router.get("/{team_id}/requests")
def get_team_requests(team_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    reqs = session.exec(select(JoinRequests).where(JoinRequests.team_id == team_id)).all()
    result = []
    for r in reqs:
        u = session.get(Users, r.user_id)
        if u:
            result.append({
                "id": r.id,
                "user_id": u.id,
                "requested_by_name": u.name,
                "github_url": u.github_url,
                "linkedin_url": u.linkedin_url,
                "status": r.status,
                "created_at": r.created_at
            })
    return result

@router.put("/{team_id}/requests/{req_id}")
def resolve_request(team_id: UUID, req_id: UUID, req_update: JoinRequestUpdate, background_tasks: BackgroundTasks, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this team")
        
    req = session.get(JoinRequests, req_id)
    if not req or req.team_id != team_id:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req_update.status == "Accepted":
        if session.exec(select(TeamMembers).where(TeamMembers.user_id == req.user_id)).first():
            raise HTTPException(status_code=400, detail="The Single Team Lock: This user is already in another team.")
            
        members = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id)).all()
        if len(members) >= 6:
            raise HTTPException(status_code=400, detail="The Capacity Lock: Team already has maximum members (6)")
            
        req.status = "Accepted"
        session.add(req)
        
        new_member = TeamMembers(team_id=team_id, user_id=req.user_id)
        session.add(new_member)
        session.commit()
        
        # Send Email Notification
        req_user = session.get(Users, req.user_id)
        if req_user and req_user.email:
            from app.core.email import send_email_notification
            subject = f"You have been accepted into {team.name}!"
            body = f"Congratulations {req_user.name}, your request to join team {team.name} has been accepted by the leader."
            background_tasks.add_task(send_email_notification, req_user.email, subject, body)
            
        return {"message": "Request accepted and member added"}
        
    elif req_update.status == "Rejected":
        req.status = "Rejected"
        session.add(req)
        session.commit()
        return {"message": "Request rejected"}
    else:
        raise HTTPException(status_code=400, detail="Invalid status")

@router.post("/{team_id}/finalize")
def finalize_team(team_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    members = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id)).all()
    user_ids = [m.user_id for m in members]
    
    users = session.exec(select(Users).where(Users.id.in_(user_ids))).all()
    
    # has_female = any(u.gender and u.gender.lower() == "female" for u in users)
    # if not has_female:
    #     raise HTTPException(status_code=400, detail="The Diversity Lock: Team requires at least one female member to finalize")
        
    team.is_finalized = True
    session.add(team)
    session.commit()
    return {"message": "Team finalized successfully"}

from pydantic import BaseModel
class RecruitingUpdate(BaseModel):
    is_recruiting: bool

@router.patch("/{team_id}/recruiting")
def toggle_recruiting(team_id: UUID, update: RecruitingUpdate, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    team.is_recruiting = update.is_recruiting
    session.add(team)
    session.commit()
    return {"message": "Recruiting status updated"}

@router.delete("/{team_id}/members/me")
def leave_team(team_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.leader_id == current_user.id:
        raise HTTPException(status_code=400, detail="Leader cannot leave the team. You must delete the team entirely.")
        
    member = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id, TeamMembers.user_id == current_user.id)).first()
    if not member:
        raise HTTPException(status_code=404, detail="You are not in this team")
        
    session.delete(member)
    session.commit()
    return {"message": "Left team successfully"}

@router.delete("/{team_id}/members/{user_id}")
def kick_member(team_id: UUID, user_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot kick yourself. Use delete team instead.")
        
    member = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id, TeamMembers.user_id == user_id)).first()
    if not member:
        raise HTTPException(status_code=404, detail="User not in team")
        
    session.delete(member)
    session.commit()
    return {"message": "Member kicked successfully"}

@router.delete("/{team_id}")
def delete_team(team_id: UUID, current_user: Users = Depends(get_current_user), session: Session = Depends(get_session)):
    team = session.get(Teams, team_id)
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from app.models.domain import Messages
    
    messages = session.exec(select(Messages).where(Messages.team_id == team_id)).all()
    for m in messages: session.delete(m)
    
    reqs = session.exec(select(JoinRequests).where(JoinRequests.team_id == team_id)).all()
    for r in reqs: session.delete(r)
    
    members = session.exec(select(TeamMembers).where(TeamMembers.team_id == team_id)).all()
    for m in members: session.delete(m)
    
    session.delete(team)
    session.commit()
    return {"message": "Team deleted"}
