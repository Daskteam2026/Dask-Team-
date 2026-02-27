from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import db_models
from database import get_db
import hashlib

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Pydantic models for auth
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    role: str = "employee"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str
    
    class Config:
        from_attributes = True

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(db_models.Employee).filter(
        db_models.Employee.email == request.email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new employee
    new_user = db_models.Employee(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        department=request.department,
        role=request.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(db_models.Employee).filter(
        db_models.Employee.email == request.email
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "token": f"token_{user.id}_{user.email}",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    # This would be enhanced with actual JWT token validation
    # For now, returns a demo user
    return {
        "id": 0,
        "name": "Admin",
        "email": "admin@dask.com",
        "role": "admin"
    }

