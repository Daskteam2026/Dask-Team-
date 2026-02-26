from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schema import LeaveCreate, LeaveOut
from services import leave_service
from database import get_db

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/", response_model=LeaveOut)
def apply_leave(leave: LeaveCreate, db: Session = Depends(get_db)):
    return leave_service.apply_leave(db, leave)

@router.get("/employee/{employee_id}", response_model=list[LeaveOut])
def get_leaves(employee_id: int, db: Session = Depends(get_db)):
    return leave_service.get_leaves_by_employee(db, employee_id)

@router.put("/{leave_id}/status", response_model=LeaveOut)
def update_leave_status(leave_id: int, status: str, db: Session = Depends(get_db)):
    updated = leave_service.update_leave_status(db, leave_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Leave not found")
    return updated