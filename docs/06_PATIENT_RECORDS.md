# Feature 06 — Patient Records

## Status: PENDING (partially covered by Sessions CRUD)

## Overview
Full patient record management. The `patients` table is created in Sessions CRUD, but this feature covers the deeper patient profile — medical history, past visits, vitals tracking, and the patient sidebar data.

## Database (additions to existing `patients` table)

```sql
-- Past visits / encounter history
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  encounter_type TEXT NOT NULL, -- 'office_visit', 'lab_work', 'follow_up', 'referral'
  title TEXT NOT NULL,
  summary TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vitals history
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  blood_pressure TEXT,
  heart_rate INTEGER,
  temperature FLOAT,
  spo2 FLOAT,
  respiratory_rate INTEGER,
  weight FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id, date DESC);
CREATE INDEX idx_vitals_patient ON vitals(patient_id, recorded_at DESC);

ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors see own patient encounters"
  ON encounters FOR ALL
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors see own patient vitals"
  ON vitals FOR ALL
  USING (
    patient_id IN (SELECT id FROM patients WHERE doctor_id = auth.uid())
  );
```

## Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/patients/:id/history` | Full patient profile (info + encounters + vitals + conditions) |
| POST | `/patients/:id/vitals` | Record new vitals |
| GET | `/patients/:id/vitals` | Get vitals history |
| POST | `/patients/:id/encounters` | Add encounter record |
| GET | `/patients/:id/encounters` | List encounters |

## Frontend Integration

### Patient Sidebar (future enhancement)
Currently the sidebar shows chat history. A toggle or expandable section could show:
- Patient demographics
- Allergies (from `patients.allergies`)
- Active medications (from `patients.medications`)
- Latest vitals (from `vitals` table)
- Recent encounters (from `encounters` table)
- Active conditions (from `patients.conditions`)

## Implementation Steps
1. [ ] Create `encounters` and `vitals` tables
2. [ ] Build endpoints for vitals and encounters
3. [ ] Add patient history aggregation endpoint
4. [ ] Optionally add patient info section to sidebar (expandable)
5. [ ] Auto-create encounter record when session ends
6. [ ] Auto-record vitals if captured during session

## Notes
- Encounter records auto-created when a session is completed
- Vitals could be manually entered or captured from transcript (AI extraction)
- Patient sidebar can optionally toggle between "Chat History" and "Patient Info" views
