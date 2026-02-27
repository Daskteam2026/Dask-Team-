from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
from models import db_models
from models.schema import EmployeeCreate, EmployeeUpdate, EmployeeOut
from database import get_db
from auth import verify_password, get_password_hash, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/employees", tags=["Employees"])

# Login request/response models
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=EmployeeOut)
def register(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(db_models.Employee).filter(db_models.Employee.email == employee.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new employee
    hashed_password = get_password_hash(employee.password)
    db_employee = db_models.Employee(
        name=employee.name,
        email=employee.email,
        password_hash=hashed_password,
        department=employee.department,
        role=employee.role if hasattr(employee, 'role') else "employee"
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find employee by email
    employee = db.query(db_models.Employee).filter(db_models.Employee.email == request.email).first()
    if not employee or not verify_password(request.password, employee.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": employee.email}, expires_delta=access_token_expires
    )
    
    # Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "role": employee.role,
            "department": employee.department
        }
    }

@router.get("/me")
def get_current_employee(current_user: db_models.Employee = Depends(get_current_user)):
    """Get current logged in employee info"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "join_date": current_user.join_date.isoformat() if current_user.join_date else None
    }

@router.post("/", response_model=EmployeeOut)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = db_models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/", response_model=list[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    return db.query(db_models.Employee).all()

@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(db_models.Employee).get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, updates: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = db.query(db_models.Employee).get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(db_models.Employee).get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return {"detail": "Employee deleted"}

