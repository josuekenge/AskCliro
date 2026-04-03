# Feature 04 — AI / LLM Integration

## Status: PENDING (after Transcript)

## Overview
The intelligence layer. An LLM (Claude or GPT) processes the live transcript and powers three features:
1. **SOAP note generation** — auto-generates and updates S/O/A/P sections
2. **Differential diagnoses** — surfaces ranked diagnoses with supporting evidence
3. **Cliro chat** — answers doctor's free-form questions about the patient

## Architecture
```
Transcript (real-time) → AI Pipeline → SOAP updates + Diagnoses
Doctor message (chat) → AI Pipeline → Cliro response
```

## Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/sessions/:id/analyze` | Trigger AI analysis on current transcript |
| POST | `/sessions/:id/chat` | Send doctor message, get Cliro response |
| GET | `/sessions/:id/diagnoses` | Get current diagnoses for session |

### `/sessions/:id/analyze`
Called periodically or on new transcript entries. Sends full transcript to LLM with system prompt:
- Extract SOAP note fields
- Generate differential diagnoses ranked by likelihood
- Return structured JSON

### `/sessions/:id/chat`
Doctor sends a free-form question. Backend builds context:
- Patient record (allergies, meds, conditions, vitals)
- Current transcript
- Current SOAP note
- Current diagnoses
- Sends to LLM with clinical system prompt
- Returns Cliro's response

## LLM System Prompt (Clinical)
```
You are Cliro, a clinical decision support assistant for doctors.
You have access to the patient's medical record, live transcript,
and current SOAP note. Your role is to:

1. Surface relevant clinical information
2. Suggest differential diagnoses ranked by likelihood
3. Recommend appropriate diagnostic tests
4. Answer clinical questions accurately
5. Never diagnose — always frame as "clinical decision support"
6. Cite evidence where possible (PubMed IDs)

You are NOT a replacement for clinical judgment. Always defer
to the physician's expertise.
```

## Response Schemas

### SOAP Update
```json
{
  "soap": {
    "subjective": { "text": "...", "status": "Done|Updating|Pending" },
    "objective": { "text": "...", "status": "Done|Updating|Pending" },
    "assessment": { "text": "...", "status": "Done|Updating|Pending" },
    "plan": { "text": "...", "status": "Done|Updating|Pending" }
  }
}
```

### Diagnoses
```json
{
  "diagnoses": [
    {
      "title": "Pleuritis",
      "severity": "High",
      "symptoms": "Sharp pleuritic chest pain...",
      "tests": "Chest X-ray, CBC, CRP",
      "pubmed": "34821053"
    }
  ]
}
```

### Chat Response
```json
{
  "message": "Based on the symptoms described...",
  "type": "text|soap",
  "soap_data": null
}
```

## Frontend Integration
- CliroChat: POST to `/sessions/:id/chat` on send, render response
- RightPanel Diagnoses tab: poll or subscribe to `/sessions/:id/diagnoses`
- SOAP card in chat: rendered when AI returns a SOAP update
- Auto-trigger analysis when new transcript entries arrive (debounced)

## Implementation Steps
1. [ ] Set up Anthropic/OpenAI API client in backend
2. [ ] Build clinical system prompt
3. [ ] Create `/sessions/:id/analyze` endpoint
4. [ ] Create `/sessions/:id/chat` endpoint
5. [ ] Create `/sessions/:id/diagnoses` endpoint
6. [ ] Structure SOAP extraction prompt with JSON output
7. [ ] Structure differential diagnosis prompt with ranking
8. [ ] Connect CliroChat to `/sessions/:id/chat`
9. [ ] Connect RightPanel diagnoses to `/sessions/:id/diagnoses`
10. [ ] Auto-trigger analysis on transcript updates (debounced, every 30s or on pause)
11. [ ] Handle streaming responses for chat (SSE or chunked)

## LLM Options
| Model | Best For | Cost |
|-------|----------|------|
| Claude 3.5 Sonnet | Clinical reasoning, structured output | ~$3/$15 per 1M tokens |
| GPT-4o | General, fast | ~$2.50/$10 per 1M tokens |
| GPT-4o-mini | Cost-effective, good enough | ~$0.15/$0.60 per 1M tokens |

**Recommendation**: Claude 3.5 Sonnet for clinical accuracy, GPT-4o-mini as fallback for cost.

## Notes
- All AI outputs are "clinical decision support" — never "diagnosis"
- Include disclaimer in UI: "AI-generated suggestions. Verify clinically."
- Rate limit analysis to avoid excessive API costs
- Cache diagnoses per session, only re-analyze on new transcript data
