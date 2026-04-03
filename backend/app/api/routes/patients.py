"""
Patient API routes
"""

from fastapi import APIRouter, HTTPException
from app.models.patient import PatientCreate, PatientUpdate, PatientResponse
from app.api.services import patient_service

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("", response_model=PatientResponse)
async def create_patient(data: PatientCreate):
    try:
        patient = patient_service.create_patient(data)
        return patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_patients():
    patients = patient_service.list_patients()
    return {"patients": patients, "total": len(patients)}


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    patient = patient_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: str, data: PatientUpdate):
    patient = patient_service.update_patient(patient_id, data)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
