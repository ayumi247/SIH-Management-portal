import os
import uuid
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from jose import jwt
from sqlmodel import Session, create_engine, SQLModel, select

from app.models.domain import Users, Colleges, Teams
from main import app  # Assuming main.py exports the FastAPI 'app' instance

from dotenv import load_dotenv
load_dotenv(".env")

# Generate SQLite engine for testing if we are running locally without postgres
TEST_DB_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
if TEST_DB_URL.startswith("postgres://"):
    TEST_DB_URL = TEST_DB_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False} if "sqlite" in TEST_DB_URL else {})

# Create tables
SQLModel.metadata.create_all(engine)

SECRET_KEY = os.getenv("SECRET_KEY", "test_secret_key_ci")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

client = TestClient(app)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@pytest.fixture(scope="module")
def setup_db():
    with Session(engine) as session:
        # Seed a dummy college if none exists
        college = session.exec(select(Colleges)).first()
        if not college:
            college = Colleges(name="Test College CI", location="CI Land", domain="ci.edu")
            session.add(college)
            session.commit()
            session.refresh(college)

        # Create dummy users
        u1_id = str(uuid.uuid4())
        u2_id = str(uuid.uuid4())
        
        u1 = Users(id=u1_id, name="Test Leader", email=f"leader_{uuid.uuid4().hex[:6]}@test.com", gender="Male", college_id=college.id)
        u2 = Users(id=u2_id, name="Test Member", email=f"member_{uuid.uuid4().hex[:6]}@test.com", gender="Female", college_id=college.id)
        
        session.add(u1)
        session.add(u2)
        session.commit()

        yield {
            "leader_id": u1_id,
            "member_id": u2_id,
            "college_id": college.id,
            "leader_token": create_access_token({"sub": u1_id}),
            "member_token": create_access_token({"sub": u2_id})
        }

def test_get_colleges():
    response = client.get("/api/sih/colleges")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_team_creation_and_request_flow(setup_db):
    leader_token = setup_db["leader_token"]
    member_token = setup_db["member_token"]
    headers_leader = {"Authorization": f"Bearer {leader_token}"}
    headers_member = {"Authorization": f"Bearer {member_token}"}

    # 1. Create a Team
    team_name = f"CI Test Team {uuid.uuid4().hex[:6]}"
    payload = {
        "name": team_name,
        "problem_statement": "SIH-CI-123",
        "required_skills": ["Python", "CI/CD"],
        "members": [
            {"name": "Invited User", "email": f"invited_{uuid.uuid4().hex[:6]}@test.com", "gender": "Female"}
        ]
    }
    
    response = client.post("/api/teams", json=payload, headers=headers_leader)
    assert response.status_code == 200

    # Extract team ID directly from DB since API returns empty object
    with Session(engine) as session:
        team_record = session.exec(select(Teams).where(Teams.name == team_name)).first()
        assert team_record is not None
        team_id = str(team_record.id)

    # 2. Get Team
    response = client.get(f"/api/teams/{team_id}")
    assert response.status_code == 200

    # 3. Request to Join (Member)
    response = client.post(f"/api/teams/{team_id}/requests", headers=headers_member)
    assert response.status_code == 200

    # 4. Get Requests (Leader)
    response = client.get(f"/api/teams/{team_id}/requests", headers=headers_leader)
    assert response.status_code == 200
    reqs = response.json()
    assert len(reqs) > 0
    req_id = reqs[0]["id"]

    # 5. Resolve Request (Leader)
    resolve_payload = {"status": "Accepted"}
    response = client.put(f"/api/teams/{team_id}/requests/{req_id}", json=resolve_payload, headers=headers_leader)
    assert response.status_code == 200
