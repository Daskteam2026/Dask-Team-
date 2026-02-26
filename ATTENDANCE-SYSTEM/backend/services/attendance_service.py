from sqlalchemy.orm import Session
from models import db_models
from models.schema import AttendanceCreate

def mark_attendance(db: Session, record: AttendanceCreate):
    entry = db_models.Attendance(**record.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_attendance_by_employee(db: Session, employee_id: int):
    return db.query(db_models.Attendance).filter_by(employee_id=employee_id).all()