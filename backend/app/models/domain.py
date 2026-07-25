from sqlmodel import SQLModel, Field
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import Column, String, ARRAY

class Colleges(SQLModel, table=True):
    __tablename__ = "colleges"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    location: Optional[str] = None
    domain: Optional[str] = None

class Hackathons(SQLModel, table=True):
    __tablename__ = "hackathons"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    type: str
    max_team_size: int = 6
    requires_female: bool = True

class Users(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: Optional[str] = None
    college_id: Optional[UUID] = Field(default=None, foreign_key="colleges.id")
    college_roll_number: Optional[str] = None
    phone_number: Optional[str] = None
    location: Optional[str] = None
    gender: Optional[str] = None
    study_year: Optional[int] = None
    field_of_education: Optional[str] = None
    skills: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_verified: bool = False
    oauth_provider: Optional[str] = None

class Teams(SQLModel, table=True):
    __tablename__ = "teams"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    hackathon_id: Optional[UUID] = Field(default=None, foreign_key="hackathons.id")
    college_id: Optional[UUID] = Field(default=None, foreign_key="colleges.id")
    leader_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    problem_statement: Optional[str] = None
    is_recruiting: bool = True
    required_skills: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    is_finalized: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamMembers(SQLModel, table=True):
    __tablename__ = "team_members"
    team_id: UUID = Field(foreign_key="teams.id", primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class JoinRequests(SQLModel, table=True):
    __tablename__ = "join_requests"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    team_id: Optional[UUID] = Field(default=None, foreign_key="teams.id")
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    status: str = Field(default="Pending")
    requested_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Messages(SQLModel, table=True):
    __tablename__ = "messages"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    team_id: Optional[UUID] = Field(default=None, foreign_key="teams.id")
    sender_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
