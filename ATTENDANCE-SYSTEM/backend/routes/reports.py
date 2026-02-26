from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services import attendance_service, leave_service
from database import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/attendance-summary/{employee_id}")
def attendance_summary(employee_id: int, db: Session = Depends(get_db)):
    records = attendance_service.get_attendance_by_employee(db, employee_id)
    summary = {
        "Present": sum(1 for r in records if str(r.status) == "Present"),
        "Absent": sum(1 for r in records if str(r.status) == "Absent"),
        "Leave": sum(1 for r in records if str(r.status) == "Leave"),
        "Total": len(records)
    }
    return summary

@router.get("/leave-summary/{employee_id}")
def leave_summary(employee_id: int, db: Session = Depends(get_db)):
    leaves = leave_service.get_leaves_by_employee(db, employee_id)
    return {
        "Approved": sum(1 for l in leaves if str(l.status) == "Approved"),
        "Pending": sum(1 for l in leaves if str(l.status) == "Pending"),
        "Rejected": sum(1 for l in leaves if str(l.status) == "Rejected"),
        "Total": len(leaves)
    }