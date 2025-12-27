from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Dict, List

from app.core.security import get_db, get_current_user
from app.models.equipment import Equipment
from app.models.maintenance_request import MaintenanceRequest
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

class DashboardStats(BaseModel):
    total_equipment: int
    critical_equipment: int
    total_requests: int
    pending_requests: int
    in_progress_requests: int
    completed_requests: int
    equipment_by_status: Dict[str, int]
    equipment_by_health: Dict[str, int]
    requests_by_stage: Dict[str, int]
    requests_by_priority: Dict[str, int]

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    
    # Total equipment
    total_equipment = db.query(Equipment).count()
    
    # Critical equipment - skip for now due to health_status type mismatch
    critical_equipment = 0
    
    # Total requests
    total_requests = db.query(MaintenanceRequest).count()
    
    # Requests by stage
    pending_requests = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.stage.in_(['draft', 'submitted'])
    ).count()
    
    in_progress_requests = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.stage == 'in_progress'
    ).count()
    
    completed_requests = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.stage.in_(['completed', 'closed'])
    ).count()
    
    # Equipment by status
    equipment_by_status_query = db.query(
        Equipment.status,
        func.count(Equipment.id)
    ).group_by(Equipment.status).all()
    
    equipment_by_status = {status: count for status, count in equipment_by_status_query}
    
    # Equipment by health
    equipment_by_health_query = db.query(
        Equipment.health_status,
        func.count(Equipment.id)
    ).group_by(Equipment.health_status).all()
    
    equipment_by_health = {str(health): count for health, count in equipment_by_health_query if health}
    
    # Requests by stage
    requests_by_stage_query = db.query(
        MaintenanceRequest.stage,
        func.count(MaintenanceRequest.id)
    ).group_by(MaintenanceRequest.stage).all()
    
    requests_by_stage = {str(stage): count for stage, count in requests_by_stage_query}
    
    # Requests by priority
    requests_by_priority_query = db.query(
        MaintenanceRequest.priority,
        func.count(MaintenanceRequest.id)
    ).group_by(MaintenanceRequest.priority).all()
    
    requests_by_priority = {str(priority): count for priority, count in requests_by_priority_query if priority}
    
    return DashboardStats(
        total_equipment=total_equipment,
        critical_equipment=critical_equipment,
        total_requests=total_requests,
        pending_requests=pending_requests,
        in_progress_requests=in_progress_requests,
        completed_requests=completed_requests,
        equipment_by_status=equipment_by_status,
        equipment_by_health=equipment_by_health,
        requests_by_stage=requests_by_stage,
        requests_by_priority=requests_by_priority
    )

@router.get("/recent-requests")
def get_recent_requests(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent maintenance requests"""
    requests = db.query(MaintenanceRequest)\
        .order_by(MaintenanceRequest.created_at.desc())\
        .limit(limit)\
        .all()
    
    return requests
