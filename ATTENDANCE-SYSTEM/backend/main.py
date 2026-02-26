from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from routes import employees, attendance, leaves, reports

app = FastAPI(title="Attendance System API")

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(reports.router)

# add CORS middleware (useful during development and if external frontends access the API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# serve frontend static files
frontend_dir = Path(__file__).parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

# root and html fallback
@app.get("/")
def root():
    return FileResponse(frontend_dir / "index.html")

@app.get("/{file_name}.html")
def serve_html(file_name: str):
    path = frontend_dir / f"{file_name}.html"
    if path.exists():
        return FileResponse(path)
    return FileResponse(frontend_dir / "index.html")