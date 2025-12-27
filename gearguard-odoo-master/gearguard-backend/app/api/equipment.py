from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import date
from uuid import UUID

from app.core.security import get_db, get_current_user
from app.models.equipment import Equipment
from app.models.user import User

router = APIRouter(prefix="/api/equipment", tags=["Equipment"])

# Schemas
class EquipmentOut(BaseModel):
    id: int
    name: str
    serial_number: str
    category_id: int
    location: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    status: str
    health_status: Optional[str] = None
    is_critical: bool
    assigned_to_user_id: Optional[str] = None
    maintenance_team_id: Optional[int] = None
    
    @field_validator('assigned_to_user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if v is None:
            return None
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True

class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    category_id: int
    location: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_cost: Optional[float] = None
    warranty_expiry: Optional[date] = None
    maintenance_team_id: Optional[int] = None
    default_technician_id: Optional[str] = None
    health_status: Optional[str] = "good"
    status: str = "operational"
    is_critical: bool = False
    notes: Optional[str] = None

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    health_status: Optional[str] = None
    is_critical: Optional[bool] = None
    assigned_to_user_id: Optional[str] = None
    maintenance_team_id: Optional[int] = None
    notes: Optional[str] = None

@router.get("")  # response_model temporarily disabled
def list_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = None,
    health_status: Optional[str] = None,
    category_id: Optional[int] = None,
    is_critical: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all equipment with filters and pagination"""
    query = db.query(Equipment)
    
    if status:
        query = query.filter(Equipment.status == status)
    if health_status:
        query = query.filter(Equipment.health_status == health_status)
    if category_id:
        query = query.filter(Equipment.category_id == category_id)
    if is_critical is not None:
        query = query.filter(Equipment.is_critical == is_critical)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Equipment.name.ilike(search_term)) |
            (Equipment.serial_number.ilike(search_term)) |
            (Equipment.manufacturer.ilike(search_term))
        )
    
    equipment = query.offset(skip).limit(limit).all()
    return equipment

@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single equipment by ID"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.post("", response_model=EquipmentOut, status_code=201)
def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new equipment"""
    # Check if serial number already exists
    existing = db.query(Equipment).filter(
        Equipment.serial_number == equipment_data.serial_number
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    equipment = Equipment(**equipment_data.dict())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentOut)
def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Update only provided fields
    for field, value in equipment_data.dict(exclude_unset=True).items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    return equipment

@router.delete("/{equipment_id}", status_code=204)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db.delete(equipment)
    db.commit()
    return None
