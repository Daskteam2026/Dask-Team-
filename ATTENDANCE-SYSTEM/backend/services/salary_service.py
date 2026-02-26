from sqlalchemy.orm import Session
from sqlalchemy import extract
from models import db_models

def calculate_salary(db: Session, employee_id: int, month: int, year: int, base_salary: float):
    records = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id,
        extract("month", db_models.Attendance.date) == month,
        extract("year", db_models.Attendance.date) == year
    ).all()   # <-- ensures we get ORM objects

    # Now r.status is a Python string, not a ColumnElement
    present_days = sum(1 for r in records if str(r.status) == "Present")
    total_days = len(records)
    daily_rate = base_salary / total_days if total_days else 0
    earned_salary = daily_rate * present_days

    return {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "base_salary": base_salary,
        "present_days": present_days,
        "total_days": total_days,
        "earned_salary": round(earned_salary, 2)
    }