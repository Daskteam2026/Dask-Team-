from database import SessionLocal, engine, Base, Employee
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

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
                password_hash=hash_password("admin123"),
                department="Administration",
                role="admin"
            )
            db.add(admin)
            print("Admin user created")
        
        # Check if there are any employees
        count = db.query(Employee).count()
        
        if count == 1:  # Only admin
            # Create sample employees
            employees = [
                Employee(name="John Smith", email="john@dask.com", password_hash=hash_password("password123"), department="Engineering", role="employee"),
                Employee(name="Jane Doe", email="jane@dask.com", password_hash=hash_password("password123"), department="Design", role="employee"),
                Employee(name="Bob Wilson", email="bob@dask.com", password_hash=hash_password("password123"), department="Marketing", role="employee"),
                Employee(name="Alice Brown", email="alice@dask.com", password_hash=hash_password("password123"), department="HR", role="employee"),
            ]
            
            for emp in employees:
                db.add(emp)
            
            print(f"Created {len(employees)} sample employees")
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

