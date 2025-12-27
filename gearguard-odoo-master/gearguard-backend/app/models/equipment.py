from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import uuid

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("equipment_categories.id"), nullable=False, index=True)
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    assigned_to_department = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    purchase_date = Column(Date, nullable=True)
    purchase_cost = Column(DECIMAL(10, 2), nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    maintenance_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    default_technician_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    health_status = Column(String(20), nullable=True, index=True)  # excellent, good, fair, poor, critical
    status = Column(String(20), default="operational", index=True)  # operational, maintenance, down, scrapped
    qr_code = Column(String(255), unique=True, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    is_critical = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("EquipmentCategory", back_populates="equipment")
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id], back_populates="assigned_equipment")
    maintenance_team = relationship("Team", back_populates="equipment")
    default_technician = relationship("User", foreign_keys=[default_technician_id], back_populates="default_equipment")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="equipment")
