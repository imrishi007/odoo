from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    department = Column(String(100), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="users")
    assigned_equipment = relationship("Equipment", foreign_keys="[Equipment.assigned_to_user_id]", back_populates="assigned_to")
    default_equipment = relationship("Equipment", foreign_keys="[Equipment.default_technician_id]", back_populates="default_technician")
    team_memberships = relationship("TeamMember", back_populates="user")
    created_requests = relationship("MaintenanceRequest", foreign_keys="[MaintenanceRequest.created_by_user_id]", back_populates="created_by")
    assigned_requests = relationship("MaintenanceRequest", foreign_keys="[MaintenanceRequest.assigned_technician_id]", back_populates="assigned_technician")
