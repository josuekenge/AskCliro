-- =============================================
-- AskCliro — Migration 001: Patients & Sessions
-- Run this in Supabase SQL Editor
-- =============================================

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID,
  full_name TEXT NOT NULL,
  age INTEGER,
  sex TEXT CHECK (sex IN ('M', 'F', 'Other')),
  date_of_birth DATE,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medications JSONB DEFAULT '[]',
  conditions TEXT[] DEFAULT '{}',
  mrn TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  chief_complaint TEXT NOT NULL,
  soap_note JSONB DEFAULT '{"subjective": "", "objective": "", "assessment": "", "plan": ""}',
  soap_status JSONB DEFAULT '{"subjective": "Pending", "objective": "Pending", "assessment": "Pending", "plan": "Pending"}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_doctor ON sessions(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);

-- NOTE: RLS is disabled for now (no auth yet)
-- Will enable once auth feature is built
