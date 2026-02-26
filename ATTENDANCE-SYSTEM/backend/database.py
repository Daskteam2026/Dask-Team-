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
    present = Column(Boolean, default=True)

    employee = relationship("Employee", back_populates="attendances")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    reason = Column(String)

    employee = relationship("Employee", back_populates="leaves")

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    employee = relationship("Employee", back_populates="salaries")

# Example engine (SQLite for development)
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