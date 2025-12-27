from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import datetime
from uuid import UUID

from app.core.security import get_db, get_current_user
from app.models.maintenance_request import MaintenanceRequest
from app.models.user import User
from app.models.request_history import RequestHistory

router = APIRouter(prefix="/api/requests", tags=["Maintenance Requests"])

# Schemas
class MaintenanceRequestOut(BaseModel):
    id: int
    request_number: str
    subject: str
    description: Optional[str] = None
    equipment_id: int
    maintenance_type: str
    priority: str
    stage: str
    assigned_team_id: Optional[int] = None
    assigned_technician_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    created_at: datetime
    
    @field_validator('assigned_technician_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if v is None:
            return None
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True

class MaintenanceRequestCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    equipment_id: int
    maintenance_type: str  # corrective, preventive, predictive, breakdown
    priority: str = "medium"  # low, medium, high, urgent
    scheduled_date: Optional[datetime] = None

class MaintenanceRequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    priority: Optional[str] = None
    assigned_team_id: Optional[int] = None
    assigned_technician_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    actual_duration_hours: Optional[float] = None
    actual_cost: Optional[float] = None
    resolution_notes: Optional[str] = None

class StageUpdate(BaseModel):
    stage: str
    actual_duration_hours: Optional[float] = None
    resolution_notes: Optional[str] = None

@router.get("")  # response_model temporarily disabled
def list_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    maintenance_type: Optional[str] = None,
    equipment_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all maintenance requests with filters"""
    query = db.query(MaintenanceRequest)
    
    if stage:
        query = query.filter(MaintenanceRequest.stage == stage)
    if priority:
        query = query.filter(MaintenanceRequest.priority == priority)
    if maintenance_type:
        query = query.filter(MaintenanceRequest.maintenance_type == maintenance_type)
    if equipment_id:
        query = query.filter(MaintenanceRequest.equipment_id == equipment_id)
    
    requests = query.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit).all()
    return requests

@router.get("/{request_id}", response_model=MaintenanceRequestOut)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single maintenance request by ID"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@router.post("", status_code=201)  # response_model temporarily disabled
def create_request(
    request_data: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new maintenance request"""
    # Generate request number
    count = db.query(MaintenanceRequest).count()
    request_number = f"REQ-{datetime.now().year}-{count + 1:06d}"
    
    request = MaintenanceRequest(
        **request_data.dict(),
        request_number=request_number,
        created_by_user_id=current_user.id,
        stage="new"
    )
    
    db.add(request)
    db.commit()
    db.refresh(request)
    
    # Log history
    history = RequestHistory(
        request_id=request.id,
        changed_by_user_id=current_user.id,
        field_name="status",
        old_value=None,
        new_value="draft",
        change_type="created"
    )
    db.add(history)
    db.commit()
    
    return request

@router.put("/{request_id}", response_model=MaintenanceRequestOut)
def update_request(
    request_id: int,
    request_data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update maintenance request"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Track changes for history
    changes = []
    for field, new_value in request_data.dict(exclude_unset=True).items():
        old_value = getattr(request, field)
        if old_value != new_value:
            changes.append((field, str(old_value) if old_value else None, str(new_value) if new_value else None))
            setattr(request, field, new_value)
    
    # Update timestamps based on stage
    if request_data.stage:
        if request_data.stage == "in_progress" and not request.started_at:
            request.started_at = datetime.utcnow()
        elif request_data.stage in ["completed", "closed"] and not request.completed_at:
            request.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(request)
    
    # Log changes
    for field, old_val, new_val in changes:
        history = RequestHistory(
            request_id=request.id,
            changed_by_user_id=current_user.id,
            field_name=field,
            old_value=old_val,
            new_value=new_val,
            change_type="updated"
        )
        db.add(history)
    
    db.commit()
    return request

@router.patch("/{request_id}/stage")
def update_stage(
    request_id: int,
    stage_data: StageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update request stage"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    old_stage = request.stage
    request.stage = stage_data.stage
    
    if stage_data.actual_duration_hours:
        request.actual_duration_hours = stage_data.actual_duration_hours
    
    if stage_data.resolution_notes:
        request.resolution_notes = stage_data.resolution_notes
    
    # Update timestamps
    if stage_data.stage == "in_progress" and not request.started_at:
        request.started_at = datetime.utcnow()
    elif stage_data.stage in ["completed", "closed"] and not request.completed_at:
        request.completed_at = datetime.utcnow()
    
    db.commit()
    
    # Log history
    history = RequestHistory(
        request_id=request.id,
        changed_by_user_id=current_user.id,
        field_name="stage",
        old_value=old_stage,
        new_value=stage_data.stage,
        change_type="stage_changed"
    )
    db.add(history)
    db.commit()
    
    return {"message": "Stage updated successfully", "stage": stage_data.stage}

@router.delete("/{request_id}", status_code=204)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete maintenance request"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db.delete(request)
    db.commit()
    return None

@router.get("/{request_id}/history")
def get_request_history(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get request change history"""
    history = db.query(RequestHistory)\
        .filter(RequestHistory.request_id == request_id)\
        .order_by(RequestHistory.timestamp.desc())\
        .all()
    
    return history
