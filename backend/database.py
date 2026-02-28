import os
from sqlalchemy import Column, Integer, String, Date, Boolean, Float, ForeignKey
from datetime import date as _date
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="employee")  # "admin" or "employee"
    # automatically set to today's date when new employee is created
    join_date = Column(Date, nullable=False, default=_date.today)

    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    salaries = relationship("Salary", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    present = Column(Boolean, default=True)
    status = Column(String, default="Present")  # Present, Absent, Late, Leave

    employee = relationship("Employee", back_populates="attendances")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String, nullable=False)  # Casual Leave, Sick Leave, Earned Leave
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected, Cancelled

    employee = relationship("Employee", back_populates="leaves")

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    employee = relationship("Employee", back_populates="salaries")

# Database engine selection: prefer DATABASE_URL (Postgres/Neon) falling back to SQLite for local dev
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Replace postgresql:// with postgresql+psycopg:// for psycopg driver (v3+)
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(DATABASE_URL, echo=True)
else:
    # SQLite for local development
    engine = create_engine(
        "sqlite:///./attendance.db",
        echo=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)

