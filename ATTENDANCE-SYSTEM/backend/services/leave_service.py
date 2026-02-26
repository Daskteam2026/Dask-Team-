from sqlalchemy.orm import Session
from models import db_models
from models.schema import LeaveCreate

def apply_leave(db: Session, leave: LeaveCreate):
    request = db_models.Leave(**leave.dict())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

def get_leaves_by_employee(db: Session, employee_id: int):
    return db.query(db_models.Leave).filter_by(employee_id=employee_id).all()

def update_leave_status(db: Session, leave_id: int, status: str):
    leave = db.query(db_models.Leave).get(leave_id)
    if not leave:
        return None
    db.query(db_models.Leave).filter_by(id=leave_id).update({"status": status})
    db.commit()
    db.refresh(leave)
    return leave