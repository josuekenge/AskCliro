# Feature 03 — Real-time Transcript

## Status: PENDING (after Sessions CRUD)

## Overview
Live speech-to-text transcription during a session. Audio is captured from the doctor's microphone, sent to a speech-to-text service, and the resulting text is streamed back to the frontend in real time. The transcript is stored per session.

## Database

```sql
CREATE TABLE transcript_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('doctor', 'patient')) NOT NULL,
  speaker_name TEXT,
  text TEXT NOT NULL,
  timestamp_seconds FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcript_session ON transcript_entries(session_id, created_at);

ALTER TABLE transcript_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access own session transcripts"
  ON transcript_entries FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE doctor_id = auth.uid())
  );
```

## Architecture
```
Browser Mic → WebSocket → Backend → Speech-to-Text API → Backend → WebSocket → Frontend
                                    (Deepgram / Whisper / Google STT)
```

## Backend
| Type | Route | Description |
|------|-------|-------------|
| WebSocket | `ws://.../ws/transcript/:session_id` | Audio stream in, transcript chunks out |
| GET | `/sessions/:id/transcript` | Get full transcript for a session |

### WebSocket Flow
1. Frontend opens WebSocket with session_id
2. Frontend sends raw audio chunks (PCM/WAV)
3. Backend pipes to speech-to-text service (Deepgram recommended — real-time, speaker diarization)
4. Backend receives text chunks with speaker labels
5. Backend saves to `transcript_entries` table
6. Backend pushes text back to frontend via WebSocket

## Frontend Integration

### RightPanel — Transcript Tab
- Connect to WebSocket on session mount
- Append new entries to transcript list in real time
- Auto-scroll to latest entry

### RightPanel — Footer
- Mic button toggles `MediaRecorder` / `getUserMedia`
- Stream audio chunks to WebSocket
- Waveform visualizer driven by `AnalyserNode` from Web Audio API
- Session timer increments while recording

## Implementation Steps
1. [ ] Create `transcript_entries` table in Supabase
2. [ ] Set up WebSocket endpoint in backend (FastAPI WebSocket)
3. [ ] Integrate speech-to-text service (Deepgram real-time API)
4. [ ] Handle speaker diarization (doctor vs patient)
5. [ ] Save transcript entries to database as they arrive
6. [ ] Build frontend WebSocket hook (`useTranscript`)
7. [ ] Connect mic button to `getUserMedia` + `MediaRecorder`
8. [ ] Stream audio to backend WebSocket
9. [ ] Render live transcript entries in RightPanel
10. [ ] Build waveform visualizer with Web Audio API
11. [ ] Implement session timer
12. [ ] Add `GET /sessions/:id/transcript` for loading past transcripts

## Speech-to-Text Options
| Service | Real-time | Speaker ID | Cost |
|---------|-----------|------------|------|
| Deepgram | Yes | Yes | ~$0.0043/min |
| Google Cloud STT | Yes | Yes | ~$0.006/min |
| Whisper (OpenAI) | No (batch) | No | ~$0.006/min |
| AssemblyAI | Yes | Yes | ~$0.005/min |

**Recommendation**: Deepgram — best real-time performance, native speaker diarization, WebSocket API.

## Notes
- Audio format: 16-bit PCM, 16kHz mono recommended for STT
- Speaker diarization distinguishes doctor vs patient voices
- Fallback: manual speaker label toggle if diarization isn't reliable
- Transcript is the source of truth — AI features consume transcript to generate SOAP and diagnoses
