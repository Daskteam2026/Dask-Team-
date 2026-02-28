#!/usr/bin/env python3
"""
Neon Database Initialization Script
Initializes the database schema on your Neon Postgres instance.

Usage:
    python init_neon_db.py
    
Or with environment variable:
    DATABASE_URL="postgresql://..." python init_neon_db.py
"""

import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(Path(__file__).parent))

def init_database():
    """Initialize database tables"""
    try:
        from backend.database import engine, Base
        
        print("Initializing Neon database schema...")
        print("=" * 60)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✓ Database initialization complete!")
        print("\nTables created:")
        print("  - employees")
        print("  - attendance")
        print("  - leaves")
        print("  - salaries")
        print("\n" + "=" * 60)
        
        return True
        
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set!")
        print("\nUsage:")
        print("  Windows PowerShell:")
        print('    $env:DATABASE_URL = "postgresql://..."')
        print("    python init_neon_db.py")
        print("\n  Linux/Mac:")
        print('    export DATABASE_URL="postgresql://..."')
        print("    python init_neon_db.py")
        sys.exit(1)
    
    success = init_database()
    sys.exit(0 if success else 1)
