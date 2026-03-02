# Attendance System - Quick Start Guide

This quick guide covers the essential commands needed to run the project
locally, test the API, and deploy the frontend and backend using Vercel and
Netlify. For a more detailed explanation refer to `README.md`.

---

## 1. Local Development

```bash
cd ATTENDANCE-SYSTEM
python -m venv .venv
. \.venv\Scripts\Activate.ps1    # PowerShell (Windows)
# or: source .venv/bin/activate    # macOS/Linux
pip install -r backend/requirements.txt
```

Set up the database URL (optional, for Neon Postgres):

```bash
# Windows PowerShell
$env:DATABASE_URL = "postgresql://<user>:<pass>@<host>/neondb?sslmode=require"
```

Initialize and seed the database:

```bash
python init_neon_db.py
python seed_database.py
```

Run the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open the browser at http://localhost:8000/ to view the frontend, and
http://localhost:8000/docs for Swagger API docs.

---

## 2. API Testing (Swagger UI)

Use the interactive documentation at `/docs` to exercise the endpoints.
Example JSON payloads are pre-populated in the Swagger interface.

---

## 3. Deploying

* **Frontend (Vercel)**: Simply point Vercel to this repository and it will serve
the `frontend/` directory as a static site. The `vercel.json` file already
contains the necessary configuration.
* **Backend (Netlify)**: Point Netlify at this repository, and it will build the
Python dependencies and publish a serverless function from `functions/app.py`.
  Ensure the `DATABASE_URL` environment variable is set in Netlify's settings.

---

## 4. Useful Commands

```bash
# git operations
git add .
git commit -m "<message>"
git push origin master

# run tests
pytest backend/tests
```

## 5. Environment Variables

See `.env.example` for details. Typical variables:

```
DATABASE_URL=postgresql://...
SECRET_KEY=...
HOST=0.0.0.0
PORT=8000
```

---

## 6. Troubleshooting

Common issues are documented in `README.md` under the "Troubleshooting" section.

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
3. ✓ Frontend/backend deployment configurations added (Vercel/Netlify)
4. → Add more features (notifications, reports, etc.)

For detailed deployment info, see **NEON_DB.md**

---

## Support

- **Neon Docs**: https://neon.tech/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Swagger**: http://127.0.0.1:8000/docs (when running)
