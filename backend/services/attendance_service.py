from sqlalchemy.orm import Session
from ..models import db_models
from ..models.schema import AttendanceCreate

def mark_attendance(db: Session, record: AttendanceCreate):
    entry = db_models.Attendance(**record.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_attendance_by_employee(db: Session, employee_id: int):
    return db.query(db_models.Attendance).filter(db_models.Attendance.employee_id == employee_id).all()

def get_all_attendance(db: Session):
    return db.query(db_models.Attendance).order_by(db_models.Attendance.date.desc()).all()

