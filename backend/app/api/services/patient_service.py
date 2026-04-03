"""
Patient service — Supabase operations
"""

from app.core.database import supabase
from app.models.patient import PatientCreate, PatientUpdate, generate_mrn

# No auth yet — will be auth.uid() later
DOCTOR_ID = None


def create_patient(data: PatientCreate) -> dict:
    row = {
        "full_name": data.full_name,
        "age": data.age,
        "sex": data.sex,
        "date_of_birth": data.date_of_birth,
        "blood_type": data.blood_type,
        "allergies": data.allergies,
        "medications": data.medications,
        "conditions": data.conditions,
        "mrn": generate_mrn(),
    }
    if DOCTOR_ID:
        row["doctor_id"] = DOCTOR_ID
    result = supabase.table("patients").insert(row).execute()
    return result.data[0]


def list_patients() -> list:
    query = supabase.table("patients").select("*").order("created_at", desc=True)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    return result.data


def get_patient(patient_id: str) -> dict | None:
    query = supabase.table("patients").select("*").eq("id", patient_id).limit(1)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    return result.data[0] if result.data else None


def update_patient(patient_id: str, data: PatientUpdate) -> dict | None:
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return get_patient(patient_id)

    query = supabase.table("patients").update(update_data).eq("id", patient_id)
    if DOCTOR_ID:
        query = query.eq("doctor_id", DOCTOR_ID)
    result = query.execute()
    return result.data[0] if result.data else None
