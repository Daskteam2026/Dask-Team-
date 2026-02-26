import os

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "intern_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

# SQLAlchemy connection string
SQLALCHEMY_DATABASE_URI = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Other environment settings
DEBUG = os.getenv("DEBUG", "True") == "True"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

# Attendance system settings
ATTENDANCE_THRESHOLD = int(os.getenv("ATTENDANCE_THRESHOLD", "75"))
LEAVE_LIMIT = int(os.getenv("LEAVE_LIMIT", "12"))
SALARY_BASE = float(os.getenv("SALARY_BASE", "30000.00"))