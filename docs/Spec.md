# AskCliro — Product Specification

## What We're Building

AskCliro is an AI-powered ambient clinical assistant for physicians. It listens to a doctor-patient conversation in real time, transcribes it live, builds a structured SOAP note automatically, and simultaneously surfaces differential diagnoses and evidence-based treatment suggestions — all during the visit. The goal is to eliminate the cognitive overload of listening, documenting, and diagnosing simultaneously.

---

## Core Problem

Physicians today must:
1. Listen to the patient
2. Ask follow-up questions
3. Document everything in real time (or after hours)
4. Form a diagnosis
5. Recall relevant clinical guidelines

This all happens simultaneously in a 15–20 minute appointment window. Burnout is at crisis levels. Most documentation happens *after hours*, eating into personal time. AskCliro collapses all of this into a single AI-assisted flow.

---

## Target User

- Primary care physicians
- General practitioners
- Urgent care doctors
- Eventually: specialists (cardiology, oncology, etc.)

---

## Product Vision

A two-panel web interface:
- **Left panel:** Live rolling transcript of the doctor-patient conversation with speaker labels (Doctor / Patient)
- **Right panel:** Two live-updating sections:
  - **SOAP Note** — builds itself in real time as the conversation progresses (Subjective, Objective, Assessment, Plan)
  - **Clinical Suggestions** — differential diagnoses ranked by likelihood, evidence-based treatment options, relevant drug interactions, and cited medical literature pulled from PubMed/OpenFDA

The doctor finishes the visit, reviews the auto-generated note, makes minor edits, and signs off. No after-hours charting.

---

## Core Features (MVP)

### 1. Real-Time Transcription
- Stream audio from the browser microphone via WebSocket
- Deepgram Medical model for transcription (best accuracy for clinical terminology)
- Speaker diarization — labels Doctor vs Patient turns
- Live display of transcript on left panel with timestamps

### 2. Ambient SOAP Note Generation
- As transcript chunks arrive, Claude builds and updates the SOAP note in real time
- Structured output:
  - **S (Subjective):** Patient-reported symptoms, history, chief complaint
  - **O (Objective):** Vitals, physical exam findings (doctor-reported)
  - **A (Assessment):** Working diagnosis / differential
  - **P (Plan):** Treatment plan, medications, follow-ups, referrals
- Doctor can edit any section inline before signing off
- Export to PDF or copy to clipboard for EHR paste

### 3. Real-Time Diagnosis Suggestions
- Claude analyzes the rolling transcript context
- Surfaces top 3–5 differential diagnoses ranked by likelihood based on symptoms mentioned
- Each diagnosis links to relevant PubMed literature and OpenFDA drug data
- Updates dynamically as new symptoms or history emerge in conversation
- Flags red flags or urgent conditions prominently (e.g. "Consider ruling out PE given symptom profile")

### 4. Medical Terminology Grounding
- RAG layer using PubMed API + OpenFDA API (both free)
- Translates patient plain language → clinical terminology automatically
- Ensures diagnosis suggestions are grounded in real peer-reviewed literature, not hallucinated
- Citations shown inline in the suggestions panel

### 5. Session Management
- Each visit is a session with unique ID
- Full transcript saved per session
- Generated SOAP note saved and editable
- Session history dashboard for the doctor
- HIPAA-compliant storage (no raw audio retained after processing)

---

## Tech Stack

### Frontend
- **React 18 + TypeScript** — component-based UI
- **Create React App** — standard React development setup with zero-config build
- **Tailwind CSS v4** — utility-first styling with latest features and performance improvements
- **PostCSS** — CSS processing pipeline
- **WebSocket client** — real-time audio streaming and transcript updates
- **Two-panel layout** — transcript left, SOAP note + suggestions right

### Backend
- **FastAPI (Python)** — main API server
- **WebSockets** — real-time audio stream from browser to server
- **Deepgram SDK** — pipes audio stream to Deepgram Medical transcription model
- **Anthropic SDK (Claude)** — processes transcript chunks, generates SOAP note + diagnosis suggestions
- **PubMed API** — free medical literature search for RAG grounding
- **OpenFDA API** — free drug data and adverse event grounding

### Database & Auth
- **Supabase (PostgreSQL)** — session storage, transcript history, SOAP notes
- **Supabase Auth** — doctor authentication (email/password + Google OAuth)
- **Supabase RLS** — row-level security so each doctor only sees their own sessions

### Infrastructure
- **Railway** — FastAPI backend deployment
- **Netlify** — React frontend deployment
- **Supabase** — managed database + auth

---

## Core Data Flow

```
Doctor opens session
        ↓
Browser captures microphone audio
        ↓
Audio streamed via WebSocket → FastAPI backend
        ↓
FastAPI pipes audio stream → Deepgram Medical API
        ↓
Deepgram returns transcript chunks with speaker labels in real time
        ↓
Transcript chunks stored in session context (rolling window)
        ↓
Every N seconds or on meaningful utterance → send rolling transcript to Claude
        ↓
Claude returns:
  - Updated SOAP note (structured JSON)
  - Updated differential diagnoses (ranked list with reasoning)
        ↓
If diagnosis confidence is low → RAG query to PubMed API for grounding
        ↓
Results streamed back via WebSocket → Frontend updates both panels live
        ↓
Visit ends → doctor reviews, edits, and signs off on final SOAP note
        ↓
Session saved to Supabase → available in history dashboard
```

---

## Claude Prompt Strategy

### SOAP Note Generation Prompt
```
You are an expert clinical scribe. Given the following rolling transcript of a doctor-patient 
conversation, generate and update a structured SOAP note.

Transcript so far:
{transcript}

Return a JSON object with keys: subjective, objective, assessment, plan.
Be concise and use proper clinical terminology. Do not hallucinate findings 
not mentioned in the transcript. If information for a section is not yet 
available, return an empty string for that key.
```

### Differential Diagnosis Prompt
```
You are an expert physician assistant. Based on the following doctor-patient 
conversation transcript, suggest the top 3-5 differential diagnoses ranked 
by likelihood. For each diagnosis provide:
- Name (proper clinical term)
- Likelihood (High / Medium / Low)
- Key supporting symptoms from the transcript
- One recommended next step (test, referral, or treatment)
- Flag if urgent/red flag condition

Transcript:
{transcript}

Return as a JSON array. Ground your suggestions in clinical evidence. 
Do not suggest diagnoses not supported by the transcript.
```

---

## RAG Strategy (Medical Grounding)

When Claude generates a diagnosis suggestion:
1. Extract diagnosis name
2. Query PubMed API: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={diagnosis}&retmax=3`
3. Fetch abstracts for top 3 results
4. Inject abstracts as context into Claude's next call
5. Claude cites the PubMed article inline in the suggestion

This ensures every diagnosis suggestion has a real peer-reviewed citation, not a hallucinated one.

---

## WebSocket Architecture

```
Browser (microphone) 
  → WS connection to FastAPI /ws/session/{session_id}
  → FastAPI opens Deepgram streaming connection
  → Audio bytes piped to Deepgram in real time
  → Deepgram sends back transcript events
  → FastAPI buffers transcript, triggers Claude every 10 seconds or on sentence completion
  → FastAPI sends SOAP + diagnosis updates back to browser via same WS connection
  → Frontend updates panels live
```

---

## HIPAA Considerations (MVP)

- No raw audio stored after transcription is complete
- Transcripts stored encrypted in Supabase
- No patient PII in logs
- Doctor must agree to Terms of Use confirming they are a licensed physician
- Session data tied to authenticated doctor account only
- Note: Full HIPAA BAA compliance (Business Associate Agreement with Supabase) required before selling to healthcare institutions

---

## What AskCliro Is NOT (MVP Scope)

- Not an EHR — it does not integrate with Epic/Cerner in v1 (copy-paste workflow only)
- Not a diagnostic tool — suggestions are decision support, not diagnoses
- Not a replacement for physician judgment — every suggestion requires doctor review
- Not for patients — doctor-facing only

---

## Monetization (Post-MVP)

- **Freemium:** 10 sessions/month free, paid plan for unlimited
- **Per seat SaaS:** $99–$199/month per physician
- **Clinic plans:** $500–$2000/month for multi-physician practices
- **Enterprise:** Hospital system contracts (long-term play)

---

## MVP Success Criteria

- Doctor can open a session, speak naturally with a patient, and receive a complete SOAP note and differential diagnoses by end of visit
- Transcription latency under 2 seconds
- Diagnosis suggestions update within 10 seconds of new symptoms being mentioned
- At least 1 PubMed citation per diagnosis suggestion
- 5 physicians use it and say it saves them meaningful time

---

## Risks

| Risk | Mitigation |
|------|-----------|
| FDA classification as medical device | Frame as decision support, not diagnostic tool. Include clear disclaimers. |
| Transcription accuracy on medical terms | Use Deepgram Medical model specifically trained on clinical vocabulary |
| Claude hallucinating diagnoses | RAG grounding with PubMed + strict prompting to only use transcript evidence |
| HIPAA compliance | No raw audio storage, encrypted transcripts, Supabase BAA |
| Doctor trust / adoption | Start with tech-forward early adopter physicians, not hospital procurement |

---

## Build Order (Suggested)

1. FastAPI WebSocket server + Deepgram integration (transcription working end-to-end)
2. Frontend — live transcript panel displaying in real time
3. Claude integration — SOAP note generation from transcript
4. Claude integration — differential diagnosis suggestions
5. PubMed RAG layer — citations on diagnoses
6. Supabase — session storage, auth, history dashboard
7. Polish UI — two-panel layout, editing, export
8. Deploy — Railway + Netlify