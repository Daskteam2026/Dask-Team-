from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from models import db_models
from database import get_db
from services import attendance_service, leave_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/attendance-summary/{employee_id}")
def attendance_summary(employee_id: int, db: Session = Depends(get_db)):
    """Get attendance summary for an employee"""
    records = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id
    ).all()
    
    summary = {
        "Present": sum(1 for r in records if r.status == "Present"),
        "Absent": sum(1 for r in records if r.status == "Absent"),
        "Late": sum(1 for r in records if r.status == "Late"),
        "Leave": sum(1 for r in records if r.status == "Leave"),
        "Total": len(records)
    }
    return summary

@router.get("/leave-summary/{employee_id}")
def leave_summary(employee_id: int, db: Session = Depends(get_db)):
    """Get leave summary for an employee"""
    leaves = db.query(db_models.Leave).filter(
        db_models.Leave.employee_id == employee_id
    ).all()
    
    return {
        "Approved": sum(1 for l in leaves if l.status == "Approved"),
        "Pending": sum(1 for l in leaves if l.status == "Pending"),
        "Rejected": sum(1 for l in leaves if l.status == "Rejected"),
        "Cancelled": sum(1 for l in leaves if l.status == "Cancelled"),
        "Total": len(leaves)
    }

@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics (for admin)"""
    today = date.today()
    
    # Total employees
    total_employees = db.query(db_models.Employee).count()
    
    # Present today
    present_today = db.query(db_models.Attendance).filter(
        db_models.Attendance.date == today,
        db_models.Attendance.present == True
    ).count()
    
    # On leave today
    on_leave_today = db.query(db_models.Leave).filter(
        db_models.Leave.start_date <= today,
        db_models.Leave.end_date >= today,
        db_models.Leave.status == "Approved"
    ).count()
    
    # Late entries today
    late_today = db.query(db_models.Attendance).filter(
        db_models.Attendance.date == today,
        db_models.Attendance.status == "Late"
    ).count()
    
    return {
        "totalEmployees": total_employees,
        "presentToday": present_today,
        "onLeaveToday": on_leave_today,
        "lateToday": late_today
    }

@router.get("/employee/{employee_id}/salary")
def get_employee_salary(employee_id: int, month: str, year: int, base_salary: float = 5000, db: Session = Depends(get_db)):
    """Calculate salary for an employee"""
    from services import salary_service
    return salary_service.calculate_salary(db, employee_id, month, year, base_salary)

