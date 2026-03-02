# Common Terminal Commands

This file collects the most frequently used shell commands for developing,
building, testing and deploying the Attendance System.

## Environment Setup

```powershell
cd ATTENDANCE-SYSTEM
python -m venv .venv
.\.venv\Scripts\Activate.ps1          # PowerShell
# or source .venv/bin/activate           # macOS / Linux
```

## Install Dependencies

```bash
pip install -r backend/requirements.txt
```

## Database Tasks

```bash
# create sqlite file or connect to PostgreSQL via DATABASE_URL
python init_neon_db.py            # create tables
python seed_database.py           # seed with sample data
```

## Running the Server Locally

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend will be available at `http://localhost:8000/`.

## Testing

```bash
pytest backend/tests
```

## Git Operations

```bash
# initialize repository (first time only)
git init
# add and commit changes
git add .
git commit -m "Your message"
# push to GitHub (adjust remote URL as needed)
git remote add origin <repo-url>
git push -u origin master
```

## Deployment

Frontend (Vercel):
```bash
# using Vercel CLI if installed
evercel --prod frontend
```

Backend (Netlify):
```bash
# from repository root
netlify deploy --prod
# the build command in netlify.toml will install requirements
```

## Environment Variables

```powershell
# Windows PowerShell
$env:DATABASE_URL = "postgresql://user:pass@host/dbname"
```

The backend reads `DATABASE_URL` automatically; if absent, it falls back to
SQLite stored in `backend/attendance.db`.
