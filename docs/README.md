# AskCliro — AI-Powered Ambient Clinical Assistant

An intelligent system that listens to doctor-patient conversations in real time, automatically generates structured SOAP notes, and surfaces evidence-based clinical suggestions during patient visits.

## Project Overview

AskCliro eliminates physician documentation burden by:
- **Real-time transcription** of doctor-patient conversations with speaker diarization
- **Ambient SOAP note generation** that updates as the conversation progresses
- **Clinical decision support** with differential diagnoses and treatment suggestions
- **Medical literature grounding** via PubMed and OpenFDA APIs

See [Spec.md](./Spec.md) for complete product specification.

---

## Project Structure

```
AskCliro/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/      # API endpoints
│   │   │   └── services/    # Business logic
│   │   ├── models/          # Database & Pydantic models
│   │   ├── core/            # Configuration
│   │   └── utils/           # Helper functions
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and WebSocket clients
│   │   ├── types/           # TypeScript interfaces
│   │   ├── styles/          # Global styles
│   │   └── App.tsx
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── Spec.md                  # Product specification
└── README.md                # This file
```

---

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **WebSockets** - Real-time audio streaming
- **Deepgram API** - Medical transcription
- **Anthropic SDK (Claude)** - SOAP note & diagnosis generation
- **PubMed API** - Medical literature search
- **OpenFDA API** - Drug data & adverse events
- **Supabase** - Database & authentication
- **SQLAlchemy** - ORM

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **WebSocket** - Real-time communication

### Infrastructure
- **Supabase** - PostgreSQL database & auth
- **Railway** - Backend deployment
- **Netlify** - Frontend deployment

---

## Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or: source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys:
   # - DEEPGRAM_API_KEY
   # - ANTHROPIC_API_KEY
   # - SUPABASE_URL
   # - SUPABASE_KEY
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

   Server runs at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints and keys
   # REACT_APP_API_URL=http://localhost:8000
   # REACT_APP_SUPABASE_URL=your_url
   # REACT_APP_SUPABASE_ANON_KEY=your_key
   ```

4. Run dev server:
   ```bash
   npm start
   ```

   Frontend runs at `http://localhost:3000`

---

## Core Features (MVP)

- ✅ Real-time transcription with speaker labels
- ✅ Live SOAP note generation
- ✅ Differential diagnosis suggestions
- ✅ Medical literature grounding
- ✅ Session management
- ✅ Doctor authentication
- ✅ Session history dashboard

---

## API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - List user's sessions
- `GET /api/sessions/{session_id}` - Get session details
- `PATCH /api/sessions/{session_id}` - Update SOAP note
- `DELETE /api/sessions/{session_id}` - Delete session

### WebSocket
- `WS /ws/session/{session_id}` - Real-time audio & transcript stream

---

## Data Flow

```
Audio Input → WebSocket → Deepgram → Transcript
           ↓
Claude (SOAP Note + Diagnosis)
           ↓
PubMed/OpenFDA (Medical Grounding)
           ↓
Database (Session Storage)
           ↓
Frontend (Live UI Updates)
```

---

## Environment Variables

### Backend (.env)
```
DEEPGRAM_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## Development Workflow

1. Backend runs on `localhost:8000`
2. Frontend runs on `localhost:5173`
3. WebSocket connections via `ws://localhost:8000`
4. Database: Supabase

---

## Deployment

### Backend (Railway)
```bash
railway up
```

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/ folder
```

---

## Team

- **Product Spec**: Clinical AI Assistant for Physicians
- **Goal**: Reduce physician burnout through intelligent documentation automation

---

## License

[Add license here]

---

## Contact

[Add contact information here]
