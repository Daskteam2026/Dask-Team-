from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from backend.routes import employees, attendance, leaves, reports
from backend.auth import router as auth_router

app = FastAPI(title="Attendance System API")

# If deployed on Netlify, wrap with Mangum (serverless adapter)
try:
    from mangum import Mangum
    handler = Mangum(app)  # exported function for Netlify
except ImportError:
    handler = None


# Include all routers
app.include_router(auth_router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(reports.router)

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# serve frontend static files (used during local development)
frontend_dir = Path(__file__).parent / "frontend"

# NOTE: In production front/backend will be separated (frontend on Vercel,
# backend on Netlify). The static routes below are harmless but not used by
# the deployed backend.

# Mount static file directories (css, js, images)
app.mount("/css", StaticFiles(directory=frontend_dir / "css"), name="css")
app.mount("/js", StaticFiles(directory=frontend_dir / "js"), name="js")
app.mount("/images", StaticFiles(directory=frontend_dir / "images"), name="images")

# root and html fallback (these routes must come AFTER static mounts)
@app.get("/")
async def root():
    return FileResponse(frontend_dir / "home.html", media_type="text/html")

@app.get("/{file_name}.html")
async def serve_html(file_name: str):
    path = frontend_dir / f"{file_name}.html"
    if path.exists():
        return FileResponse(path, media_type="text/html")
    return FileResponse(frontend_dir / "home.html", media_type="text/html")

