# Feature 01 — Authentication

## Status: SKIPPED (for now)

## Overview
Doctor authentication using Supabase Auth. Doctors sign up / log in with email+password. Session tokens are managed by Supabase. Protected routes on frontend redirect to login if unauthenticated.

## Database
- Supabase `auth.users` table (built-in)
- Custom `doctors` table linked to `auth.users.id`

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own profile"
  ON doctors FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = id);
```

## Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/signup` | Register new doctor |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current doctor profile |

## Frontend Pages
- `LoginPage.tsx` — email + password form
- `App.tsx` — wrap routes in auth guard, redirect to `/login` if no session

## Implementation Steps
1. [ ] Create `doctors` table in Supabase with RLS policies
2. [ ] Add signup endpoint in backend
3. [ ] Add login endpoint in backend
4. [ ] Add auth middleware to protect all other routes
5. [ ] Build LoginPage UI
6. [ ] Add auth context/provider in frontend
7. [ ] Protect routes with auth guard
8. [ ] Store JWT in localStorage, attach to API requests

## Notes
- Skipping for now to focus on core CRUD
- Will revisit after Sessions CRUD is working
- All other endpoints should still be designed with `doctor_id` in mind
