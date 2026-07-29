from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings
from app.api.routers import auth, sih, teams, chat

app = FastAPI(title="Hackathon Matchmaker API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware for Authlib
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.include_router(auth.router, prefix="/api")
app.include_router(sih.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Hackathon Matchmaker API running"}
