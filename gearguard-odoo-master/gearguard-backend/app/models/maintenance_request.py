from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, DECIMAL, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), index=True)
    category_id = Column(Integer, ForeignKey("equipment_categories.id"), nullable=True)
    maintenance_type = Column(String(20), nullable=False)  # corrective, preventive, predictive, breakdown
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    stage = Column(String(20), default="draft", index=True)  # draft, submitted, approved, in_progress, completed, closed, cancelled
    assigned_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    assigned_technician_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=True, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    estimated_duration_hours = Column(DECIMAL(5, 2), nullable=True)
    actual_duration_hours = Column(Float, nullable=True)
    cost_estimate = Column(DECIMAL(10, 2), nullable=True)
    actual_cost = Column(DECIMAL(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_requests")
    category = relationship("EquipmentCategory")
    assigned_team = relationship("Team", back_populates="maintenance_requests")
    assigned_technician = relationship("User", foreign_keys=[assigned_technician_id], back_populates="assigned_requests")
    created_by = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_requests")
    history = relationship("RequestHistory", back_populates="request", cascade="all, delete-orphan")
