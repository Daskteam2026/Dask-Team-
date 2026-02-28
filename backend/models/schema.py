from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class EmployeeBase(BaseModel):
    name: str
    department: str
    email: str

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: int
    role: str
    join_date: date
    model_config = ConfigDict(from_attributes=True)

class EmployeeLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: EmployeeOut

class AttendanceBase(BaseModel):
    employee_id: int
    date: date

class AttendanceCreate(AttendanceBase):
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    present: bool = True
    status: str = "Present"

class AttendanceOut(AttendanceBase):
    id: int
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    present: bool
    status: str
    model_config = ConfigDict(from_attributes=True)

class LeaveBase(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveCreate(LeaveBase):
    pass

class LeaveOut(LeaveBase):
    id: int
    status: str
    model_config = ConfigDict(from_attributes=True)

class LeaveStatusUpdate(BaseModel):
    status: str

