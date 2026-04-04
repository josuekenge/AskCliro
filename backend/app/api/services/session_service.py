"""
Session service — Supabase operations
"""

from datetime import datetime, timezone
from app.core.database import supabase
from app.models.session import SessionCreate, SessionUpdate
from app.api.services.patient_service import create_patient, DOCTOR_ID
from app.models.patient import PatientCreate


def get_active_session() -> dict | None:
    """Check if doctor has an active session"""
    query = supabase.table("sessions").select("*, patient:patients(*)").eq("status", "active").limit(1)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    return result.data[0] if result.data else None


def create_session(data: SessionCreate) -> dict:
    """Create patient (if needed) and start a new session"""
    active = get_active_session()
    if active:
        raise ValueError("You already have an active session. End it before starting a new one.")

    # Create patient inline
    patient_data = PatientCreate(
        full_name=data.patient_name,
        age=data.patient_age,
        sex=data.patient_sex,
        allergies=data.allergies,
        conditions=data.conditions,
        medications=[{"name": m.strip()} for m in data.medications if m.strip()],
    )
    patient = create_patient(patient_data)

    # Create session
    row = {
        "patient_id": patient["id"],
        "status": "active",
        "chief_complaint": data.chief_complaint,
        "soap_note": {"subjective": "", "objective": "", "assessment": "", "plan": ""},
        "soap_status": {"subjective": "Pending", "objective": "Pending", "assessment": "Pending", "plan": "Pending"},
    }
    if DOCTOR_ID:
        row["doctor_id"] = DOCTOR_ID
    result = supabase.table("sessions").insert(row).execute()
    session = result.data[0]
    session["patient"] = patient
    return session


def list_sessions(status: str | None = None, patient_id: str | None = None) -> list:
    """List sessions with optional filters"""
    query = supabase.table("sessions").select("*, patient:patients(*)").order("created_at", desc=True)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    if status:
        query = query.eq("status", status)
    if patient_id:
        query = query.eq("patient_id", patient_id)
    result = query.execute()
    return result.data


def get_session(session_id: str) -> dict | None:
    """Get session with patient info"""
    query = supabase.table("sessions").select("*, patient:patients(*)").eq("id", session_id).limit(1)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    return result.data[0] if result.data else None


def update_session(session_id: str, data: SessionUpdate) -> dict | None:
    """Update session fields (SOAP, chief complaint)"""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return get_session(session_id)

    query = supabase.table("sessions").update(update_data).eq("id", session_id)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    if not result.data:
        return None
    return get_session(session_id)


def end_session(session_id: str) -> dict | None:
    """End an active session"""
    session = get_session(session_id)
    if not session:
        return None
    if session["status"] != "active":
        raise ValueError("Session is not active")

    now = datetime.now(timezone.utc)
    started = datetime.fromisoformat(session["started_at"].replace("Z", "+00:00"))
    duration = int((now - started).total_seconds())

    result = (
        supabase.table("sessions")
        .update({
            "status": "completed",
            "ended_at": now.isoformat(),
            "duration_seconds": duration,
        })
        .eq("id", session_id)
        .execute()
    )
    if not result.data:
        return None
    return result.data[0]
