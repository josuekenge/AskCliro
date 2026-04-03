"""
Patient Pydantic models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import random
import string


def generate_mrn() -> str:
    digits = ''.join(random.choices(string.digits, k=8))
    return f"MRN-{digits}"


class PatientCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=150)
    sex: Optional[str] = Field(None, pattern=r'^(M|F|Other)$')
    date_of_birth: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    medications: list = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)


class PatientUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=150)
    sex: Optional[str] = Field(None, pattern=r'^(M|F|Other)$')
    date_of_birth: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    medications: Optional[list] = None
    conditions: Optional[List[str]] = None


class PatientResponse(BaseModel):
    id: str
    full_name: str
    age: Optional[int] = None
    sex: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    medications: list = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)
    mrn: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
