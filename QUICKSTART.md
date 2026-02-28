# Attendance System - Quick Start Guide

## Current Status
✓ **Frontend & Backend Integrated** - Single `main.py` server  
✓ **Neon PostgreSQL Configured** - Connection string set up  
✓ **Docker Ready** - `Dockerfile` included for containerization  
✓ **Swagger API Docs** - Auto-generated at `/docs`  
✓ **GitHub Actions** - CI/CD workflow for Docker builds  

---

## Project Details

**Neon Organization**: org-twilight-scene-43357167  
**Neon Project**: autumn-river-75249190 (ATTENDANCE-SYSTEM)  
**Database**: PostgreSQL (neondb)  
**Region**: eu-west-2 (AWS Ireland)  

---

## 1. Local Development

### Option A: Using SQLite (Fastest, No Setup)
```bash
cd ATTENDANCE-SYSTEM
python -m uvicorn main:app --reload
```
Visit: http://127.0.0.1:8000/docs

### Option B: Using Neon Database

1. **Set environment variable** (Windows PowerShell):
```powershell
$env:DATABASE_URL = "postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

Or **Linux/Mac**:
```bash
export DATABASE_URL="postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

Or **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

2. **Initialize database** (run once):
```bash
python init_neon_db.py
```

3. **Start server**:
```bash
python -m uvicorn main:app --reload
```

---

## 2. API Testing with Swagger UI

Once the server is running, visit:
- **Interactive Docs**: http://127.0.0.1:8000/docs
- **Alternative Docs**: http://127.0.0.1:8000/redoc

### Example Requests (in Swagger):

**Register a new employee**:
```bash
POST /employees/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "department": "Engineering",
  "role": "employee"
}
```

**Login**:
```bash
POST /employees/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Mark Attendance**:
```bash
POST /attendance/check-in
Content-Type: application/json

{
  "employee_id": 1
}
```

**Get Employee Info**:
```bash
GET /employees/1
```

---

## 3. Docker Deployment

### Build locally:
```bash
docker build -t attendance-app:latest -f Dockerfile .
```

### Run with SQLite:
```bash
docker run -p 8000:8000 attendance-app:latest
```

### Run with Neon:
```bash
docker run \
  -e DATABASE_URL="postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require" \
  -e SECRET_KEY="your-secure-secret-key" \
  -p 8000:8000 \
  attendance-app:latest
```

---

## 4. Deploy to Production (Neon App Platform)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Neon integration and Docker setup"
git push origin main
```

### Step 2: Enable GitHub Actions
- Go to your GitHub repo → Actions → enable workflows

### Step 3: Deploy via Neon
1. Go to [Neon Console](https://console.neon.tech)
2. Select project **autumn-river-75249190**
3. Navigate to **Apps** section
4. Create new app:
   - **Container Image**: `ghcr.io/YOUR_USERNAME/YOUR_REPO:latest`
   - **Environment Variables**:
     - `DATABASE_URL`: (your Neon connection string)
     - `SECRET_KEY`: (generate secure random string)
   - **Port**: 8000

5. Deploy and monitor

---

## 5. Key Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI entry point (serves frontend + API) |
| `backend/database.py` | SQLAlchemy models & DB connection |
| `backend/routes/` | API route handlers |
| `backend/auth.py` | JWT authentication |
| `frontend/` | HTML/CSS/JS (served as static files) |
| `Dockerfile` | Container image definition |
| `.github/workflows/build-and-push.yml` | CI/CD pipeline |
| `init_neon_db.py` | Database schema initialization |
| `.env` | Environment variables (Neon credentials) |

---

## 6. Troubleshooting

### "Cannot connect to database"
- **Check**: `echo $env:DATABASE_URL` (Windows) or `echo $DATABASE_URL` (Linux)
- **Solution**: Ensure `DATABASE_URL` is set before running the app

### "ModuleNotFoundError: psycopg"
- **Solution**: Run `pip install psycopg[binary]`

### "Tables not created"
- **Solution**: Run `python init_neon_db.py` to initialize schema

### "API returns 401 Unauthorized"
- **Cause**: Missing JWT token
- **Solution**: Login first via `/employees/login` and use token in Authorization header

---

## 7. API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Home page |
| `/docs` | GET | No | Swagger UI |
| `/employees/` | GET | No | List employees |
| `/employees/register` | POST | No | Register employee |
| `/employees/login` | POST | No | Login employee |
| `/employees/{id}` | GET | Yes | Get employee |
| `/attendance/` | POST | No | Mark attendance |
| `/attendance/check-in` | POST | No | Check in |
| `/attendance/check-out` | POST | No | Check out |
| `/leaves/` | POST | No | Apply leave |
| `/reports/attendance-summary/{id}` | GET | No | Attendance report |

---

## 8. Next Steps

1. ✓ Database configured (Neon)
2. ✓ API endpoints ready
3. ✓ Docker container ready
4. → Push to GitHub and deploy via Neon
5. → Add more features (notifications, reports, etc.)

For detailed deployment info, see **NEON_DEPLOYMENT.md**

---

## Support

- **Neon Docs**: https://neon.tech/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Swagger**: http://127.0.0.1:8000/docs (when running)
