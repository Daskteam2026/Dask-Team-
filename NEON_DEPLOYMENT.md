# Attendance System Neon Deployment Guide

## Project Details
- **Organization**: org-twilight-scene-43357167 (Twilight Scene)
- **Project ID**: autumn-river-75249190 (ATTENDANCE-SYSTEM)
- **Database**: neondb (PostgreSQL via Neon)
- **Branch**: production (br-solitary-art-abgz0rkn)
- **Region**: eu-west-2 (AWS Ireland)

## Connection Details
- **Host**: ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner
- **Port**: 5432 (via pooler)

## Setup Instructions

### 1. Local Development with Neon Database

Load the environment variables:
```bash
# Windows PowerShell
$env:DATABASE_URL = "postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

Or use a `.env` file (already created):
```bash
# File: .env
# Contains DATABASE_URL and other secrets
```

Install Python package for PostgreSQL support (already done):
```bash
pip install psycopg[binary]>=3.2
```

Start the dev server:
```bash
cd ATTENDANCE-SYSTEM
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Docker Container Deployment

Build the Docker image:
```bash
docker build -t attendance-app:latest -f ATTENDANCE-SYSTEM/Dockerfile .
```

Run the container with Neon database:
```bash
docker run \
  -e DATABASE_URL="postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require" \
  -e SECRET_KEY="your-secure-secret-key" \
  -p 8000:8000 \
  attendance-app:latest
```

### 3. Deploy to Neon App Platform (Recommend for Production)

#### A. Push Docker Image to GitHub Container Registry (GHCR)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add Neon PostgreSQL integration and Docker setup"
git push origin main
```

2. The GitHub Actions workflow (`.github/workflows/build-and-push.yml`) will automatically:
   - Build the Docker image
   - Push to `ghcr.io/YOUR_USERNAME/YOUR_REPO:latest`

3. In GitHub, enable the workflow if not already enabled.

#### B. Deploy via Neon App Platform

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project: **autumn-river-75249190**
3. Navigate to **Apps** or **Compute** section
4. Create a new app/deployment:
   - **Container Image**: ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
   - **Environment Variables**:
     - `DATABASE_URL`: postgresql://neondb_owner:npg_a5oTXW9EcGHd@ep-cold-art-ab08qs0j-pooler.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
     - `SECRET_KEY`: (generate a secure random value)
   - **Port**: 8000

5. Deploy and monitor from the Neon console

### 4. Test the Deployment

Once deployed, test the API:
```bash
# Test API docs (Swagger)
curl http://localhost:8000/docs

# Test root endpoint
curl http://localhost:8000/

# List employees
curl http://localhost:8000/employees/
```

Or visit:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **Home**: http://localhost:8000/

### 5. Database Management in Neon Console

1. Go to [Neon Console](https://console.neon.tech)
2. Select **autumn-river-75249190** project
3. Use **SQL Editor** to:
   - View tables
   - Run queries
   - Manage schema
   - Monitor performance

### Troubleshooting

**Issue**: "Connection refused" or "Database not reachable"
- **Solution**: Verify `DATABASE_URL` environment variable is set correctly
- **Check**: `echo $env:DATABASE_URL` (Windows PowerShell)

**Issue**: Tables not created
- **Solution**: The app creates tables automatically on startup
- **Manual**: Run `python -c "from main import app; from backend.database import Base, engine; Base.metadata.create_all(bind=engine)"`

**Issue**: Authentication or SSL errors
- **Solution**: Ensure `sslmode=require` and `channel_binding=require` are in the connection string (they are by default)

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes (production) |
| `SECRET_KEY` | JWT signing key | Yes (change in production) |
| `HOST` | Server bind address | No (default: 0.0.0.0) |
| `PORT` | Server port | No (default: 8000) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home page |
| `/docs` | GET | Swagger UI / API documentation |
| `/redoc` | GET | ReDoc documentation |
| `/employees/` | GET | List all employees |
| `/employees/` | POST | Register/create employee |
| `/employees/{id}` | GET | Get employee details |
| `/employees/{id}` | PUT | Update employee |
| `/employees/{id}` | DELETE | Delete employee |
| `/attendance/` | POST | Mark attendance |
| `/attendance/employee/{id}` | GET | Get employee attendance |
| `/attendance/check-in` | POST | Check in employee |
| `/attendance/check-out` | POST | Check out employee |
| `/leaves/` | POST | Apply for leave |
| `/leaves/` | GET | List all leaves |
| `/reports/attendance-summary/{id}` | GET | Attendance report |
| `/reports/leave-summary/{id}` | GET | Leave report |
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login user |
| `/auth/me` | GET | Get current user info |

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon CLI Reference](https://neon.tech/docs/reference/neon-cli)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy with PostgreSQL](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)

## Support

For issues with:
- **Neon Database**: https://neon.tech/docs/support
- **FastAPI**: https://fastapi.tiangolo.com
- **This Project**: Check the README.md in the ATTENDANCE-SYSTEM folder
