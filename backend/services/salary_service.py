from sqlalchemy.orm import Session
from ..models import db_models
from ..database import Employee

def calculate_salary(db: Session, employee_id: int, month: str, year: int, base_salary: float):
    """Calculate salary based on attendance"""
    # Get attendance for the month
    from datetime import date
    from calendar import monthrange
    
    first_day = date(year, month, 1)
    last_day = date(year, month, monthrange(year, month)[1])
    
    attendance_records = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id,
        db_models.Attendance.date >= first_day,
        db_models.Attendance.date <= last_day
    ).all()
    
    # Count present days
    present_days = sum(1 for r in attendance_records if r.present)
    total_days = len(attendance_records)
    
    # Calculate salary
    if total_days > 0:
        daily_rate = base_salary / 30
        total_salary = daily_rate * present_days
    else:
        total_salary = 0
    
    return {
        "employee_id": employee_id,
        "month": f"{year}-{month:02d}",
        "base_salary": base_salary,
        "present_days": present_days,
        "absent_days": total_days - present_days,
        "total_days": total_days,
        "calculated_salary": round(total_salary, 2)
    }

def get_salaries_by_employee(db: Session, employee_id: int):
    """Get all salary records for an employee"""
    return db.query(db_models.Salary).filter(db_models.Salary.employee_id == employee_id).all()

