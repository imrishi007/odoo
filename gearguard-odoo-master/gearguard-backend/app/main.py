from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.db.base import Base
from app.db.session import engine

# 👇 IMPORT ALL MODELS HERE (IMPORTANT)
from app.models.role import Role
from app.models.user import User
from app.models.team import Team, TeamMember
from app.models.equipment_category import EquipmentCategory
from app.models.equipment import Equipment
from app.models.maintenance_request import MaintenanceRequest
from app.models.request_history import RequestHistory

from app.api import equipment, requests, auth, dashboard

app = FastAPI(
    title="GearGuard CMMS API",
    description="Computerized Maintenance Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 👇 CREATE TABLES AFTER MODELS ARE IMPORTED
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(equipment.router)
app.include_router(requests.router)

@app.get("/")
def root():
    return {
        "message": "GearGuard CMMS API",
        "version": "1.0.0",
        "docs": "/docs"
    }
