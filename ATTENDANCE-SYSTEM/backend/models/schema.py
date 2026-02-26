from pydantic import BaseModel, ConfigDict
from datetime import date

class EmployeeBase(BaseModel):
    name: str
    department: str

class EmployeeCreate(EmployeeBase): pass
class EmployeeUpdate(BaseModel):
    name: str | None = None
    department: str | None = None

class EmployeeOut(EmployeeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str

class AttendanceCreate(AttendanceBase): pass
class AttendanceOut(AttendanceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LeaveBase(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str

class LeaveCreate(LeaveBase): pass
class LeaveOut(LeaveBase):
    id: int
    status: str
    model_config = ConfigDict(from_attributes=True)
