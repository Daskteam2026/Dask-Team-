from sqlalchemy.orm import Session
from ..models import db_models
from ..models.schema import LeaveCreate
from datetime import date

def apply_leave(db: Session, leave: LeaveCreate):
    entry = db_models.Leave(
        employee_id=leave.employee_id,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status="Pending"
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_leaves_by_employee(db: Session, employee_id: int):
    return db.query(db_models.Leave).filter(db_models.Leave.employee_id == employee_id).all()

def get_all_leaves(db: Session):
    return db.query(db_models.Leave).order_by(db_models.Leave.start_date.desc()).all()

def update_leave_status(db: Session, leave_id: int, status: str):
    leave = db.query(db_models.Leave).filter(db_models.Leave.id == leave_id).first()
    if leave:
        leave.status = status
        db.commit()
        db.refresh(leave)
    return leave

