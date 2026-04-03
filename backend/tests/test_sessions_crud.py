"""
Tests for Sessions CRUD API
Run: cd backend && venv/Scripts/python.exe -m pytest tests/ -v
"""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.database import supabase

client = TestClient(app, raise_server_exceptions=False)

# Track IDs for cleanup
created_session_id = None
created_patient_id = None


@pytest.fixture(autouse=True, scope="module")
def cleanup():
    """Cleanup after all tests"""
    yield
    if created_session_id:
        supabase.table("sessions").delete().eq("id", created_session_id).execute()
    if created_patient_id:
        supabase.table("patients").delete().eq("id", created_patient_id).execute()


class TestHealthCheck:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestSessionsCRUD:
    def test_01_list_sessions_empty(self):
        r = client.get("/api/sessions")
        assert r.status_code == 200
        assert "sessions" in r.json()

    def test_02_create_session(self):
        global created_session_id, created_patient_id
        r = client.post("/api/sessions", json={
            "patient_name": "Test Patient",
            "patient_age": 30,
            "patient_sex": "M",
            "chief_complaint": "Test complaint",
            "allergies": ["Penicillin"],
            "conditions": ["Hypertension"],
        })
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "active"
        assert data["chief_complaint"] == "Test complaint"
        assert data["patient"]["full_name"] == "Test Patient"
        assert data["patient"]["allergies"] == ["Penicillin"]
        created_session_id = data["id"]
        created_patient_id = data["patient_id"]

    def test_03_get_session(self):
        r = client.get(f"/api/sessions/{created_session_id}")
        assert r.status_code == 200
        assert r.json()["id"] == created_session_id

    def test_04_get_active_session(self):
        r = client.get("/api/sessions/active")
        assert r.status_code == 200
        assert r.json()["id"] == created_session_id

    def test_05_block_second_active_session(self):
        r = client.post("/api/sessions", json={
            "patient_name": "Another Patient",
            "chief_complaint": "Another complaint",
        })
        assert r.status_code == 409
        assert "already have an active session" in r.json()["detail"]

    def test_06_update_soap(self):
        r = client.patch(f"/api/sessions/{created_session_id}", json={
            "soap_note": {
                "subjective": "Test subjective",
                "objective": "",
                "assessment": "",
                "plan": "",
            },
            "soap_status": {
                "subjective": "Done",
                "objective": "Pending",
                "assessment": "Pending",
                "plan": "Pending",
            },
        })
        assert r.status_code == 200
        assert r.json()["soap_note"]["subjective"] == "Test subjective"
        assert r.json()["soap_status"]["subjective"] == "Done"

    def test_07_end_session(self):
        r = client.post(f"/api/sessions/{created_session_id}/end")
        assert r.status_code == 200
        assert r.json()["status"] == "completed"
        assert r.json()["duration_seconds"] is not None

    def test_08_end_already_ended(self):
        r = client.post(f"/api/sessions/{created_session_id}/end")
        assert r.status_code == 400
        assert "not active" in r.json()["detail"]

    def test_09_list_sessions_has_data(self):
        r = client.get("/api/sessions")
        assert r.status_code == 200
        assert r.json()["total"] >= 1

    def test_10_session_not_found(self):
        r = client.get("/api/sessions/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404


class TestPatientsCRUD:
    def test_get_patient(self):
        r = client.get(f"/api/patients/{created_patient_id}")
        assert r.status_code == 200
        assert r.json()["full_name"] == "Test Patient"
        assert r.json()["mrn"] is not None

    def test_list_patients(self):
        r = client.get("/api/patients")
        assert r.status_code == 200
        assert r.json()["total"] >= 1

    def test_update_patient(self):
        r = client.patch(f"/api/patients/{created_patient_id}", json={
            "age": 31,
            "blood_type": "O+",
        })
        assert r.status_code == 200
        assert r.json()["age"] == 31
        assert r.json()["blood_type"] == "O+"

    def test_patient_not_found(self):
        r = client.get("/api/patients/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404


class TestValidation:
    def test_create_session_missing_name(self):
        r = client.post("/api/sessions", json={
            "chief_complaint": "Something",
        })
        assert r.status_code == 422

    def test_create_session_missing_complaint(self):
        r = client.post("/api/sessions", json={
            "patient_name": "Someone",
        })
        assert r.status_code == 422

    def test_invalid_sex(self):
        r = client.post("/api/sessions", json={
            "patient_name": "Someone",
            "patient_sex": "X",
            "chief_complaint": "Something",
        })
        assert r.status_code == 422
