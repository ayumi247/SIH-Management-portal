from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import Optional
from app.core.db import get_session
from app.models.domain import Users, Colleges

router = APIRouter(prefix="/sih", tags=["SIH Discovery"])

@router.get("/colleges")
def list_colleges(session: Session = Depends(get_session)):
    return session.exec(select(Colleges)).all()

@router.get("/colleges/{college_id}/students")
def get_students_by_college(
    college_id: str,
    skills: Optional[str] = Query(None, description="Search skills"),
    year: Optional[int] = Query(None, description="Study year filter"),
    session: Session = Depends(get_session)
):
    query = select(Users).where(Users.college_id == college_id)
    
    if year:
        query = query.where(Users.study_year == year)
    
    if skills:
        skills_list = [s.strip() for s in skills.split(",")]
        query = query.where(Users.skills.overlap(skills_list))
        
    users = session.exec(query).all()
    
    return [{"id": u.id, "name": u.name, "skills": u.skills, "study_year": u.study_year, "field_of_education": u.field_of_education} for u in users]

from app.models.domain import Teams
@router.get("/colleges/{college_id}/teams")
def get_teams_by_college(
    college_id: str,
    session: Session = Depends(get_session)
):
    query = select(Teams).where(Teams.college_id == college_id, Teams.is_recruiting == True)
    teams = session.exec(query).all()
    
    # Let's also return member counts
    from app.models.domain import TeamMembers
    result = []
    for t in teams:
        members = session.exec(select(TeamMembers).where(TeamMembers.team_id == t.id)).all()
        result.append({
            "id": t.id,
            "name": t.name,
            "problem_statement": t.problem_statement,
            "is_finalized": t.is_finalized,
            "leader_id": t.leader_id,
            "member_count": len(members),
            "required_skills": t.required_skills
        })
    return result
