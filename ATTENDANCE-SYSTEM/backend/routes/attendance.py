from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.schema import AttendanceCreate, AttendanceOut
from models import db_models
from database import get_db
from services import attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceOut)
def mark_attendance(record: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_service.mark_attendance(db, record)

@router.get("/employee/{employee_id}", response_model=list[AttendanceOut])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    return attendance_service.get_attendance_by_employee(db, employee_id)