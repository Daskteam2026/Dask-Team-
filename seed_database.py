#!/usr/bin/env python3
"""
Seed Database with Sample Data
Populates the attendance system with test employees, attendance, and leave records.
"""

import sys
from pathlib import Path
from datetime import date, timedelta
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).parent))

from backend.database import SessionLocal, engine, Base
from backend.models.db_models import Employee, Attendance, Leave
from backend.auth import get_password_hash


def seed_employees(db: Session):
    """Create sample employees"""
    
    employees_data = [
        {
            "name": "John Doe",
            "email": "john@example.com",
            "password_hash": get_password_hash("password123"),
            "department": "Engineering",
            "role": "admin",
        },
        {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "password_hash": get_password_hash("password123"),
            "department": "Engineering",
            "role": "employee",
        },
        {
            "name": "Mike Johnson",
            "email": "mike@example.com",
            "password_hash": get_password_hash("password123"),
            "department": "Sales",
            "role": "employee",
        },
        {
            "name": "Sarah Williams",
            "email": "sarah@example.com",
            "password_hash": get_password_hash("password123"),
            "department": "HR",
            "role": "employee",
        },
        {
            "name": "David Brown",
            "email": "david@example.com",
            "password_hash": get_password_hash("password123"),
            "department": "Finance",
            "role": "employee",
        },
    ]
    
    for emp_data in employees_data:
        # Check if employee already exists
        existing = db.query(Employee).filter(Employee.email == emp_data["email"]).first()
        if not existing:
            employee = Employee(**emp_data)
            db.add(employee)
            print(f"  Added: {emp_data['name']}")
    
    db.commit()


def seed_attendance(db: Session):
    """Create sample attendance records for the last 10 days"""
    
    employees = db.query(Employee).all()
    today = date.today()
    
    check_in_times = ["09:00", "09:15", "09:30", "08:45"]
    check_out_times = ["17:00", "17:15", "17:30", "17:45"]
    statuses = ["Present", "Present", "Late", "Present"]
    
    for i, emp in enumerate(employees):
        for day_offset in range(10):
            record_date = today - timedelta(days=day_offset)
            
            # Check if record already exists
            existing = db.query(Attendance).filter(
                Attendance.employee_id == emp.id,
                Attendance.date == record_date
            ).first()
            
            if not existing:
                check_in = check_in_times[i % len(check_in_times)]
                check_out = check_out_times[i % len(check_out_times)]
                status = statuses[i % len(statuses)]
                
                attendance = Attendance(
                    employee_id=emp.id,
                    date=record_date,
                    check_in=check_in,
                    check_out=check_out,
                    present=True,
                    status=status,
                )
                db.add(attendance)
        
        print(f"  Added attendance for: {emp.name}")
    
    db.commit()


def seed_leaves(db: Session):
    """Create sample leave records"""
    
    employees = db.query(Employee).all()
    today = date.today()
    
    leave_types = ["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave"]
    
    leaves_data = [
        {
            "employee_id": employees[0].id,
            "leave_type": leave_types[0],
            "start_date": today + timedelta(days=10),
            "end_date": today + timedelta(days=12),
            "reason": "Personal",
            "status": "Approved",
        },
        {
            "employee_id": employees[1].id,
            "leave_type": leave_types[1],
            "start_date": today + timedelta(days=5),
            "end_date": today + timedelta(days=6),
            "reason": "Medical checkup",
            "status": "Approved",
        },
        {
            "employee_id": employees[2].id,
            "leave_type": leave_types[2],
            "start_date": today + timedelta(days=20),
            "end_date": today + timedelta(days=27),
            "reason": "Vacation",
            "status": "Pending",
        },
        {
            "employee_id": employees[3].id,
            "leave_type": leave_types[0],
            "start_date": today - timedelta(days=5),
            "end_date": today - timedelta(days=3),
            "reason": "Personal work",
            "status": "Approved",
        },
    ]
    
    for leave_data in leaves_data:
        # Check if leave already exists
        existing = db.query(Leave).filter(
            Leave.employee_id == leave_data["employee_id"],
            Leave.start_date == leave_data["start_date"],
        ).first()
        
        if not existing:
            leave = Leave(**leave_data)
            db.add(leave)
            emp_name = db.query(Employee).get(leave_data["employee_id"]).name
            print(f"  Added leave for: {emp_name} ({leave_data['leave_type']})")
    
    db.commit()


def main():
    """Main seed function"""
    
    print("=" * 60)
    print("SEEDING DATABASE WITH SAMPLE DATA")
    print("=" * 60)
    
    # Create tables
    print("\n1. Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("   Tables ready")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Seed employees
        print("\n2. Seeding employees...")
        seed_employees(db)
        
        # Seed attendance
        print("\n3. Seeding attendance records...")
        seed_attendance(db)
        
        # Seed leaves
        print("\n4. Seeding leave records...")
        seed_leaves(db)
        
        print("\n" + "=" * 60)
        print("DATABASE SEEDING COMPLETE!")
        print("=" * 60)
        
        print("\nTest Credentials:")
        print("-" * 60)
        print("User: john@example.com")
        print("Pass: password123")
        print("Role: admin")
        print("-" * 60)
        print("\nUser: jane@example.com")
        print("Pass: password123")
        print("Role: employee")
        print("-" * 60)
        
        print("\nNext Steps:")
        print("1. Start the server: python -m uvicorn main:app --reload")
        print("2. Visit: http://127.0.0.1:8000/docs")
        print("3. Login with above credentials")
        print("4. Test the API endpoints")
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Failed to seed database: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        db.close()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
