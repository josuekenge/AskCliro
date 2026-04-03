"""
FastAPI Application Factory
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import patients_router, sessions_router


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""

    app = FastAPI(
        title="AskCliro API",
        description="AI-Powered Ambient Clinical Assistant",
        version="0.1.0",
    )

    # Add CORS middleware
    origins = settings.allowed_origins_list
    if settings.ENVIRONMENT == "development":
        origins = ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(patients_router)
    app.include_router(sessions_router)

    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "ok"}

    return app

app = create_app()
