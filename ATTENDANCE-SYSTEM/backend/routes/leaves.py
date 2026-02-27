from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import db_models
from models.schema import LeaveCreate, LeaveOut, LeaveStatusUpdate
from database import get_db

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/", response_model=LeaveOut)
def apply_leave(leave: LeaveCreate, db: Session = Depends(get_db)):
    """Apply for leave"""
    # Check if employee exists
    employee = db.query(db_models.Employee).get(leave.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Create leave request
    db_leave = db_models.Leave(
        employee_id=leave.employee_id,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status="Pending"
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/employee/{employee_id}", response_model=List[LeaveOut])
def get_leaves(employee_id: int, db: Session = Depends(get_db)):
    """Get all leave requests for an employee"""
    return db.query(db_models.Leave).filter(
        db_models.Leave.employee_id == employee_id
    ).order_by(db_models.Leave.start_date.desc()).all()

@router.get("/all")
def get_all_leaves(db: Session = Depends(get_db)):
    """Get all leave requests (for admin)"""
    leaves = db.query(db_models.Leave).order_by(db_models.Leave.start_date.desc()).all()
    result = []
    for leave in leaves:
        employee = db.query(db_models.Employee).get(leave.employee_id)
        result.append({
            "id": leave.id,
            "employee_id": leave.employee_id,
            "employee_name": employee.name if employee else "Unknown",
            "leave_type": leave.leave_type,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "reason": leave.reason,
            "status": leave.status
        })
    return result

@router.put("/{leave_id}/status", response_model=LeaveOut)
def update_leave_status(leave_id: int, status_update: LeaveStatusUpdate, db: Session = Depends(get_db)):
    """Update leave status (Approve/Reject)"""
    leave = db.query(db_models.Leave).get(leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    leave.status = status_update.status
    db.commit()
    db.refresh(leave)
    return leave

@router.delete("/{leave_id}")
def cancel_leave(leave_id: int, db: Session = Depends(get_db)):
    """Cancel a leave request"""
    leave = db.query(db_models.Leave).get(leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    leave.status = "Cancelled"
    db.commit()
    return {"detail": "Leave cancelled"}

