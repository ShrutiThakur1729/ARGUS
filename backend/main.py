from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.database import engine, Base

# Import all models to ensure they are registered with Base metadata
from backend.models.user import User
from backend.models.agent import Agent
from backend.models.telemetry import Telemetry
from backend.models.alert import Alert
from backend.models.incident import Incident
from backend.models.playbook import Playbook
from backend.models.prediction import Prediction

# Import Routers
from backend.api.auth import router as auth_router
from backend.api.agents import router as agents_router
from backend.api.telemetry import router as telemetry_router
from backend.api.alerts import router as alerts_router
from backend.api.incidents import router as incidents_router
from backend.api.playbooks import router as playbooks_router
from backend.api.predictions import router as predictions_router
from backend.api.health import router as health_router
from backend.router.alert_dispatcher import router as dispatcher_router

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ARGUS - AI Cyber Decision Intelligence Platform for Critical National Infrastructure",
    version="1.0.0",
    debug=settings.DEBUG,
)

# CORS configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers under the V1 prefix
prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=f"{prefix}/auth", tags=["Authentication"])
app.include_router(agents_router, prefix=f"{prefix}/agents", tags=["Agents"])
app.include_router(telemetry_router, prefix=f"{prefix}/telemetry", tags=["Telemetry"])
app.include_router(alerts_router, prefix=f"{prefix}/alerts", tags=["Alerts"])
app.include_router(incidents_router, prefix=f"{prefix}/incidents", tags=["Incidents"])
app.include_router(playbooks_router, prefix=f"{prefix}/playbooks", tags=["Playbooks"])
app.include_router(predictions_router, prefix=f"{prefix}/predictions", tags=["Predictions"])
app.include_router(dispatcher_router, prefix=f"{prefix}/dispatcher", tags=["Dispatcher"])

# Health router registered at root and V1 prefix
app.include_router(health_router, prefix="/health", tags=["System Health"])
app.include_router(health_router, prefix=f"{prefix}/health", tags=["System Health"])

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Access documentation at /docs",
        "docs_url": "/docs",
        "health_url": "/health",
    }
