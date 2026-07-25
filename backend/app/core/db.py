from sqlmodel import create_engine, Session
from app.core.config import settings

# Adjust the database URL if it uses postgres:// instead of postgresql://
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url, echo=False)

def get_session():
    with Session(engine) as session:
        yield session
