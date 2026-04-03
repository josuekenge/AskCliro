# Feature 02 — Sessions CRUD

## Status: IN PROGRESS

---

## User Story

**As a doctor**, I open AskCliro and see my dashboard. On first use it's empty — just the stats cards at zero and an empty sessions table.

I click **"New Session"**, which takes me to a **clean form page** where I fill in:
- Patient name (required)
- Age (required)
- Sex (M/F/Other)
- Chief complaint (required)
- Allergies (optional, comma-separated)
- Existing conditions (optional)

I click **"Start Session"** — this creates the patient record (if new) and starts an active session. I'm taken to the session page where Cliro is ready.

**Only one session can be active at a time.** If I try to start a new session while one is active, I'm prompted to end or resume the current one.

The **dashboard shows a single unified table** — each row is a session with the patient name, chief complaint, status, date, and doctor. "Patients" and "Sessions" nav items show the same view (sessions grouped/filterable by patient).

During the visit, the session is **"active"**. When I click **"End session"**, the session is marked **"completed"**, duration is calculated, and I return to the dashboard.

From the dashboard, I can click any session to **reopen it** — not just read-only. I can:
- Resume the conversation with Cliro
- Re-listen to parts of the transcript (like Otter.ai playback)
- Continue editing the SOAP note
- The session status stays "completed" but is fully interactive

---

## Database

```sql
-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID,  -- no FK until auth is built, hardcoded for now
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
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID,  -- hardcoded for now
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
CREATE INDEX idx_sessions_doctor ON sessions(doctor_id, created_at DESC);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_patients_doctor ON patients(doctor_id);
```

## Backend Endpoints

### Patients
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/patients` | Create new patient |
| GET | `/api/patients` | List all patients for doctor |
| GET | `/api/patients/:id` | Get patient details |
| PATCH | `/api/patients/:id` | Update patient info |

### Sessions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/sessions` | Start new session (creates patient if needed) |
| GET | `/api/sessions` | List all sessions (filterable by status, patient) |
| GET | `/api/sessions/:id` | Get full session details (with patient info) |
| PATCH | `/api/sessions/:id` | Update session (SOAP, chief complaint) |
| POST | `/api/sessions/:id/end` | End session (status=completed, calc duration) |

### Validation Rules
- `POST /api/sessions` — reject if doctor already has an active session
- `POST /api/sessions/:id/end` — only works on active sessions
- Patient name + chief complaint required for new session

### Request/Response Examples

**POST /api/sessions**
```json
// Request
{
  "patient_name": "J. Martinez",
  "patient_age": 34,
  "patient_sex": "M",
  "chief_complaint": "Chest pain, 3 days",
  "allergies": ["Penicillin"],
  "conditions": ["Essential hypertension"]
}

// Response
{
  "id": "uuid",
  "patient_id": "uuid",
  "status": "active",
  "chief_complaint": "Chest pain, 3 days",
  "started_at": "2026-04-03T10:32:00Z",
  "patient": {
    "id": "uuid",
    "full_name": "J. Martinez",
    "age": 34,
    "sex": "M"
  }
}
```

**GET /api/sessions**
```json
// Response
{
  "sessions": [
    {
      "id": "uuid",
      "status": "active",
      "chief_complaint": "Chest pain, 3 days",
      "started_at": "2026-04-03T10:32:00Z",
      "ended_at": null,
      "duration_seconds": null,
      "patient": {
        "id": "uuid",
        "full_name": "J. Martinez",
        "age": 34,
        "sex": "M"
      }
    }
  ],
  "total": 1
}
```

**POST /api/sessions/:id/end**
```json
// Response
{
  "id": "uuid",
  "status": "completed",
  "ended_at": "2026-04-03T10:46:00Z",
  "duration_seconds": 840
}
```

## Frontend Pages & Integration

### New Session Form (`/session/new`)
- Clean full-page form (centered, max-w-lg)
- Fields: patient name, age, sex, chief complaint, allergies, conditions
- "Start Session" button → POST /api/sessions → navigate to /session/:id
- If active session exists → show prompt: "You have an active session. Resume or end it first."

### Dashboard (`/`)
- `GET /api/sessions` → populate unified sessions table
- Stats derived from response:
  - Total patients: unique patient_ids count
  - Active sessions: sessions with status=active
  - Completed today: sessions ended today
  - Avg duration: average of duration_seconds for completed sessions
- Chart: sessions per day over time

### Session Page (`/session/:id`)
- `GET /api/sessions/:id` → load session + patient data
- `PATCH /api/sessions/:id` → update SOAP as AI generates it
- `POST /api/sessions/:id/end` → end session, navigate to dashboard
- Completed sessions are fully interactive (not read-only)

## Implementation Steps
1. [ ] Create `patients` and `sessions` tables in Supabase
2. [ ] Build backend models/schemas (Pydantic)
3. [ ] Build patient CRUD routes
4. [ ] Build session CRUD routes with active-session guard
5. [ ] Build New Session form page in frontend
6. [ ] Connect dashboard to GET /api/sessions
7. [ ] Compute dashboard stats from session data
8. [ ] Connect session page to GET/PATCH/END endpoints
9. [ ] Handle "resume active session" flow
10. [ ] Test full lifecycle: create → active → end → reopen

## Notes
- `doctor_id` hardcoded as a constant UUID until auth is built
- Only 1 active session per doctor enforced at API level
- Completed sessions are reopenable — doctor can resume chat, replay transcript
- Patient created inline during session creation (no separate patient management page for now)
- MRN auto-generated on patient creation (e.g., "MRN-" + random 8 digits)
