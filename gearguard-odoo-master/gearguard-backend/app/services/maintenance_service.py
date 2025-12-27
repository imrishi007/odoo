from sqlalchemy.orm import Session
from app.models.maintenance_request import MaintenanceRequest
from app.models.equipment import Equipment
from app.utils.audit import log_history
from datetime import datetime

from fastapi import HTTPException
from app.models.equipment import Equipment

from sqlalchemy import func
from datetime import datetime

def create_request(db, payload, user_id: str):
    equipment = (
        db.query(Equipment)
        .filter(Equipment.id == payload.equipment_id)
        .first()
    )

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # 🔑 Generate request number
    year = datetime.utcnow().year

    count = (
        db.query(func.count(MaintenanceRequest.id))
        .scalar()
    ) or 0

    request_number = f"MR-{year}-{count + 1:04d}"

    request = MaintenanceRequest(
        request_number=request_number,   # ✅ FIX
        subject=payload.subject,
        equipment_id=equipment.id,
        maintenance_type=payload.maintenance_type,
        stage="new"
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request


from fastapi import HTTPException

def update_stage(db: Session, req_id: int, payload, user_id: str):
    req = db.get(MaintenanceRequest, req_id)

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.stage == "repaired" and not payload.actual_duration_hours:
        raise HTTPException(
            status_code=400,
            detail="Duration required before closing"
        )

    if payload.stage == "scrap":
        equipment = db.get(Equipment, req.equipment_id)
        equipment.status = "scrapped"

    old_stage = req.stage
    req.stage = payload.stage
    req.actual_duration_hours = payload.actual_duration_hours

    db.commit()
    db.refresh(req)

    log_history(
        db,
        req.id,
        user_id,
        "stage",
        old_stage,
        payload.stage,
        "stage_changed"
    )

    return req
