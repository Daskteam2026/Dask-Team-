from sqlalchemy.orm import sessionmaker
from database import engine, Base, Employee, Attendance, Leave, Salary
from datetime import date
import random

Session = sessionmaker(bind=engine)
session = Session()

def seed_employees():
    # generate 20 sample employees with unique names
    departments = ["Engineering", "Design", "Marketing", "HR", "Finance"]
    base_date = date(2025, 1, 1)
    employees = []
    for i in range(1, 21):
        name = f"Employee {i}"
        dept = random.choice(departments)
        join = base_date.replace(month=((i - 1) % 12) + 1, day=((i - 1) % 28) + 1)
        employees.append(Employee(name=name, department=dept, join_date=join))
    session.add_all(employees)
    session.commit()

def seed_attendance():
    employees = session.query(Employee).all()
    for emp in employees:
        for i in range(1, 31):
            day = date(2026, 1, i)
            present = random.choice([True] * 4 + [False])  # 80% chance present
            session.add(Attendance(employee_id=emp.id, date=day, present=present))
    session.commit()

def seed_leaves():
    employees = session.query(Employee).all()
    for emp in employees:
        leave_days = random.randint(0, 3)
        for _ in range(leave_days):
            leave_date = date(2026, 1, random.randint(1, 30))
            session.add(Leave(employee_id=emp.id, date=leave_date, reason="Personal"))
    session.commit()

def seed_salaries():
    employees = session.query(Employee).all()
    for emp in employees:
        base_salary = 30000.0
        days_present = session.query(Attendance).filter_by(employee_id=emp.id, present=True).count()
        salary = base_salary * (days_present / 30)
        session.add(Salary(employee_id=emp.id, month="2026-01", amount=round(salary, 2)))
    session.commit()

def run_seed():
    # remove existing tables to start fresh
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    seed_employees()
    seed_attendance()
    seed_leaves()
    seed_salaries()

if __name__ == "__main__":
    run_seed()
    print("Seed data inserted successfully.")

if __name__ == "__main__":
    run_seed()