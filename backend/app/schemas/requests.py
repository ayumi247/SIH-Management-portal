from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: str
    college_id: UUID
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TeamMemberCreate(BaseModel):
    name: str
    email: EmailStr
    gender: str

class TeamCreate(BaseModel):
    name: str
    hackathon_id: Optional[str] = None
    problem_statement: Optional[str] = None
    members: List[TeamMemberCreate] = []
    required_skills: List[str] = []

class JoinRequestCreate(BaseModel):
    team_id: UUID

class JoinRequestUpdate(BaseModel):
    status: str # Accepted or Rejected
