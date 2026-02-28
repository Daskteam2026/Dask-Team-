from sqlalchemy.orm import sessionmaker
from .database import engine, Employee

Session = sessionmaker(bind=engine)
s = Session()
for e in s.query(Employee).all():
    print(e.id, e.name, e.department, e.join_date)
