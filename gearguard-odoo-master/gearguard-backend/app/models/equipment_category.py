from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class EquipmentCategory(Base):
    __tablename__ = "equipment_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("equipment_categories.id"), nullable=True, index=True)
    responsible_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    color_code = Column(String(7), default="#3B82F6")
    icon = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="category")
    parent = relationship("EquipmentCategory", remote_side=[id], backref="children")
    responsible_team = relationship("Team")
