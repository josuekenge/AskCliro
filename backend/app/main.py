"""
FastAPI Application Factory
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title="AskCliro API",
        description="AI-Powered Ambient Clinical Assistant",
        version="0.1.0",
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers here
    # app.include_router(sessions_router)
    # app.include_router(auth_router)
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "ok"}
    
    return app

app = create_app()
