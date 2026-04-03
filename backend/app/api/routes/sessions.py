"""
Session API routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.session import SessionCreate, SessionUpdate, SessionResponse, SessionListResponse, SessionEndResponse
from app.api.services import session_service

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(data: SessionCreate):
    try:
        session = session_service.create_session(data)
        return session
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    status: Optional[str] = Query(None, pattern=r'^(active|completed|cancelled)$'),
    patient_id: Optional[str] = None,
):
    sessions = session_service.list_sessions(status=status, patient_id=patient_id)
    return {"sessions": sessions, "total": len(sessions)}


@router.get("/active", response_model=Optional[SessionResponse])
async def get_active_session():
    """Check if there's a currently active session"""
    session = session_service.get_active_session()
    if not session:
        return None
    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(session_id: str, data: SessionUpdate):
    session = session_service.update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{session_id}/end", response_model=SessionEndResponse)
async def end_session(session_id: str):
    try:
        session = session_service.end_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
