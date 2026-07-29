from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    gender: str
    college_id: UUID
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class ProfileUpdate(BaseModel):
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    skills: Optional[List[str]] = None
    study_year: Optional[int] = None
    college_id: Optional[UUID] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

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
