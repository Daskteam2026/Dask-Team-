import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from database import SessionLocal, Base, engine

client = TestClient(app)

def setup_module():
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    # Clear all tables
    db = SessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    db.close()

def teardown_module():
    # Drop all tables after tests
    Base.metadata.drop_all(bind=engine)

def test_root_serves_index():
    response = client.get("/")
    assert response.status_code == 200
    assert "<!DOCTYPE html>" in response.text


def test_static_asset():
    # check that a known static asset is served correctly
    response = client.get("/static/css/style.css")
    assert response.status_code == 200
    assert "body" in response.text  # simple check that CSS returned


def test_api_employees_empty():
    # assuming fresh database with no employees
    response = client.get("/employees/")
    assert response.status_code == 200
    assert response.json() == []

def test_api_register_employee():
    # create a new employee via the API
    payload = {"name": "Test User", "department": "Engineering"}
    response = client.post("/employees/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["department"] == "Engineering"
    assert "id" in data
