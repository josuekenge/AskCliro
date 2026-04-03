# Feature 05 — Chat Persistence

## Status: PENDING (after AI Integration)

## Overview
Store all Cliro chat conversations per patient. Each patient can have multiple chat threads (like Claude's sidebar). Messages persist across sessions so the doctor can revisit past questions and Cliro's answers.

## Database

```sql
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('doctor', 'cliro')) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'soap', 'diagnoses')) DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_patient ON chat_threads(patient_id, updated_at DESC);
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors see own threads"
  ON chat_threads FOR ALL
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors see own messages"
  ON chat_messages FOR ALL
  USING (
    thread_id IN (SELECT id FROM chat_threads WHERE doctor_id = auth.uid())
  );
```

## Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/patients/:id/threads` | Create new chat thread |
| GET | `/patients/:id/threads` | List threads for patient (grouped by date) |
| GET | `/threads/:id/messages` | Get all messages in a thread |
| POST | `/threads/:id/messages` | Send message (triggers Cliro response) |
| PATCH | `/threads/:id` | Update thread title |
| DELETE | `/threads/:id` | Delete thread |

### Auto-title
When a thread's first message is sent, backend uses LLM to generate a short title (like Claude does).

## Frontend Integration

### PatientSidebar
- `GET /patients/:id/threads` → populate chat history list grouped by date
- Click thread → load messages into CliroChat
- "+" button → `POST /patients/:id/threads` → new empty chat
- Search filters threads client-side

### CliroChat
- `GET /threads/:id/messages` → load messages on thread select
- `POST /threads/:id/messages` → send doctor message, append Cliro response
- New messages append to state in real time

## Implementation Steps
1. [ ] Create `chat_threads` and `chat_messages` tables
2. [ ] Build thread CRUD endpoints
3. [ ] Build message endpoints with Cliro response generation
4. [ ] Auto-generate thread titles from first message
5. [ ] Connect PatientSidebar to thread list API
6. [ ] Connect CliroChat to message load/send APIs
7. [ ] Add optimistic UI updates on send
8. [ ] Implement search/filter on threads

## Notes
- Thread title auto-generated after first doctor message
- `session_id` on thread is optional — links a chat to a specific session for context
- `metadata` JSONB on messages stores SOAP data or diagnoses data for special message types
- Threads sorted by `updated_at` DESC (most recent first)
