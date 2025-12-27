from app.models.request_history import RequestHistory

def log_history(db, request_id, user_id, field, old, new, change_type):
    db.add(RequestHistory(
        request_id=request_id,
        changed_by_user_id=user_id,
        field_name=field,
        old_value=str(old),
        new_value=str(new),
        change_type=change_type
    ))
    db.commit()
