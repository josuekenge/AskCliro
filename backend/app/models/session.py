"""
Session Pydantic models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.patient import PatientResponse


class SessionCreate(BaseModel):
    """Create session — also creates patient inline"""
    patient_name: str = Field(..., min_length=1, max_length=200)
    patient_age: Optional[int] = Field(None, ge=0, le=150)
    patient_sex: Optional[str] = Field(None, pattern=r'^(M|F|Other)$')
    chief_complaint: str = Field(..., min_length=1, max_length=500)
    allergies: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)


class SessionUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    soap_note: Optional[dict] = None
    soap_status: Optional[dict] = None


class SOAPNote(BaseModel):
    subjective: str = ""
    objective: str = ""
    assessment: str = ""
    plan: str = ""


class SOAPStatus(BaseModel):
    subjective: str = "Pending"
    objective: str = "Pending"
    assessment: str = "Pending"
    plan: str = "Pending"


class SessionResponse(BaseModel):
    id: str
    doctor_id: Optional[str] = None
    patient_id: str
    status: str
    chief_complaint: str
    soap_note: Optional[dict] = None
    soap_status: Optional[dict] = None
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: Optional[str] = None
    patient: Optional[PatientResponse] = None


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int


class SessionEndResponse(BaseModel):
    id: str
    status: str
    ended_at: str
    duration_seconds: int
