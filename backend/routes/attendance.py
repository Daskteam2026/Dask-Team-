from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from ..models import db_models
from ..models.schema import AttendanceCreate, AttendanceOut
from ..database import get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceOut)
def mark_attendance(record: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee"""
    # Check if employee exists
    employee = db.query(db_models.Employee).get(record.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if attendance already marked for this date
    existing = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == record.employee_id,
        db_models.Attendance.date == record.date
    ).first()
    
    if existing:
        # Update existing record
        existing.check_in = record.check_in
        existing.check_out = record.check_out
        existing.present = record.present
        existing.status = record.status
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new attendance record
    db_record = db_models.Attendance(
        employee_id=record.employee_id,
        date=record.date,
        check_in=record.check_in,
        check_out=record.check_out,
        present=record.present,
        status=record.status
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/employee/{employee_id}", response_model=list[AttendanceOut])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    """Get attendance records for an employee"""
    return db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id
    ).order_by(db_models.Attendance.date.desc()).all()

@router.get("/today")
def get_today_attendance(db: Session = Depends(get_db)):
    """Get all attendance records for today"""
    today = date.today()
    records = db.query(db_models.Attendance).filter(
        db_models.Attendance.date == today
    ).all()
    
    # Include employee names
    result = []
    for record in records:
        employee = db.query(db_models.Employee).get(record.employee_id)
        result.append({
            "id": record.id,
            "employee_id": record.employee_id,
            "employee_name": employee.name if employee else "Unknown",
            "date": record.date,
            "check_in": record.check_in,
            "check_out": record.check_out,
            "present": record.present,
            "status": record.status
        })
    return result

@router.post("/check-in")
def check_in(employee_id: int, db: Session = Depends(get_db)):
    """Check in an employee"""
    today = date.today()
    current_time = datetime.now().strftime("%H:%M")
    
    # Check if already checked in
    existing = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id,
        db_models.Attendance.date == today
    ).first()
    
    if existing:
        if existing.check_in:
            raise HTTPException(status_code=400, detail="Already checked in")
    
    # Determine status based on time
    status = "Late" if datetime.now().hour >= 9 else "Present"
    
    if existing:
        existing.check_in = current_time
        existing.status = status
        existing.present = True
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new record
    record = db_models.Attendance(
        employee_id=employee_id,
        date=today,
        check_in=current_time,
        present=True,
        status=status
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/check-out")
def check_out(employee_id: int, db: Session = Depends(get_db)):
    """Check out an employee"""
    today = date.today()
    current_time = datetime.now().strftime("%H:%M")
    
    existing = db.query(db_models.Attendance).filter(
        db_models.Attendance.employee_id == employee_id,
        db_models.Attendance.date == today
    ).first()
    
    if not existing or not existing.check_in:
        raise HTTPException(status_code=400, detail="Not checked in")
    
    if existing.check_out:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    existing.check_out = current_time
    db.commit()
    db.refresh(existing)
    return existing

