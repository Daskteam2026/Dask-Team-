#!/usr/bin/env python3
"""Simple seed script to initialize the database with sample data"""
import sys
sys.path.insert(0, '/workspaces/Dask-Team-/ATTENDANCE-SYSTEM/backend')

from database import SessionLocal, engine, Base, Employee, Attendance, Leave
from datetime import date, timedelta
from passlib.context import CryptContext

# Simple password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_data():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(Employee).filter(Employee.email == "admin@dask.com").first()
        
        if not admin:
            # Create admin user
            admin = Employee(
                name="Admin",
                email="admin@dask.com",
                password_hash=get_password_hash("admin123"),
                department="Administration",
                role="admin"
            )
            db.add(admin)
            print("Admin user created")
        
        # Check if there are any employees
        count = db.query(Employee).count()
        
        if count <= 1:  # Only admin exists
            # Create sample employees
            employees = [
                Employee(name="John Smith", email="john@dask.com", password_hash=get_password_hash("password123"), department="Engineering", role="employee"),
                Employee(name="Jane Doe", email="jane@dask.com", password_hash=get_password_hash("password123"), department="Design", role="employee"),
                Employee(name="Bob Wilson", email="bob@dask.com", password_hash=get_password_hash("password123"), department="Marketing", role="employee"),
                Employee(name="Alice Brown", email="alice@dask.com", password_hash=get_password_hash("password123"), department="HR", role="employee"),
            ]
            
            for emp in employees:
                db.add(emp)
            
            db.commit()
            print(f"Created {len(employees)} sample employees")
        
        # Create sample attendance for today
        today = date.today()
        employees = db.query(Employee).all()
        
        for emp in employees:
            # Check if attendance already exists for today
            existing = db.query(Attendance).filter(
                Attendance.employee_id == emp.id,
                Attendance.date == today
            ).first()
            
            if not existing:
                att = Attendance(
                    employee_id=emp.id,
                    date=today,
                    check_in="09:00",
                    present=True,
                    status="Present"
                )
                db.add(att)
        
        db.commit()
        print("Sample attendance created")
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

