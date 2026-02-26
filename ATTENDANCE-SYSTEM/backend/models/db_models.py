# Models are now defined in database.py
# Import them from there for backwards compatibility
from database import Employee, Attendance, Leave, Salary

__all__ = ["Employee", "Attendance", "Leave", "Salary"]
