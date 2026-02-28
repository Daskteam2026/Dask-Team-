#!/usr/bin/env python3
"""
API Test Script - Verify attendance system is fully functional
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    """Test all major API endpoints"""
    
    print("\n" + "=" * 70)
    print("ATTENDANCE SYSTEM API TEST")
    print("=" * 70)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Home page
    print("\n[1] Testing home page...")
    try:
        r = requests.get(f"{BASE_URL}/")
        assert r.status_code == 200
        assert "html" in r.text.lower()
        print("    [PASS] Home page loads")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 2: Swagger docs
    print("[2] Testing Swagger API docs...")
    try:
        r = requests.get(f"{BASE_URL}/docs")
        assert r.status_code == 200
        assert "swagger" in r.text.lower()
        print("    [PASS] Swagger UI accessible")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 3: List employees
    print("[3] Testing GET /employees/...")
    try:
        r = requests.get(f"{BASE_URL}/employees/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"    [PASS] Retrieved {len(data)} employees")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 4: Login
    print("[4] Testing POST /employees/login...")
    try:
        payload = {
            "email": "john@example.com",
            "password": "password123"
        }
        r = requests.post(f"{BASE_URL}/employees/login", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        token = data["access_token"]
        print(f"    [PASS] Login successful, token generated")
        tests_passed += 1
        
        # Test 5: Get current user (requires token)
        print("[5] Testing GET /employees/me (authenticated)...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            r = requests.get(f"{BASE_URL}/employees/me", headers=headers)
            assert r.status_code == 200
            user_data = r.json()
            assert user_data["email"] == "john@example.com"
            print(f"    [PASS] Retrieved current user: {user_data['name']}")
            tests_passed += 1
        except Exception as e:
            print(f"    [FAIL] {e}")
            tests_failed += 1
            
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 6: Get attendance
    print("[6] Testing GET /attendance/today...")
    try:
        r = requests.get(f"{BASE_URL}/attendance/today")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"    [PASS] Retrieved today's attendance ({len(data)} records)")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 7: Get list of leaves
    print("[7] Testing GET /leaves/...")
    try:
        r = requests.get(f"{BASE_URL}/leaves/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"    [PASS] Retrieved leaves ({len(data)} records)")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Test 8: Dashboard stats
    print("[8] Testing GET /reports/dashboard-stats...")
    try:
        r = requests.get(f"{BASE_URL}/reports/dashboard-stats")
        assert r.status_code == 200
        data = r.json()
        assert "totalEmployees" in data
        print(f"    [PASS] Dashboard stats: {data['totalEmployees']} employees, {data['presentToday']} present today")
        tests_passed += 1
    except Exception as e:
        print(f"    [FAIL] {e}")
        tests_failed += 1
    
    # Summary
    print("\n" + "=" * 70)
    print(f"TEST RESULTS: {tests_passed} PASSED, {tests_failed} FAILED")
    print("=" * 70)
    
    if tests_failed == 0:
        print("\nAll tests passed! System is fully functional.")
        print("\nQuick Links:")
        print(f"  Swagger UI: {BASE_URL}/docs")
        print(f"  ReDoc: {BASE_URL}/redoc")
        print(f"  Home: {BASE_URL}/")
        print("\nTest Credentials:")
        print("  Email: john@example.com")
        print("  Pass: password123")
        return True
    else:
        return False

if __name__ == "__main__":
    import sys
    
    print("\nWaiting for server to be ready...")
    import time
    time.sleep(2)
    
    try:
        success = test_endpoints()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)
