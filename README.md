# VoiceShield 💜

A retro-purple, 90s-computer-inspired interface for synthetic voice risk screening and call-fraud prevention.

## What is included

- Login, registration, password-reset UI
- Supabase Auth integration when credentials are configured
- Responsive dashboard with retro terminal styling
- Audio upload and analysis-result screen
- Protection preferences screen
- Session-only call history with CSV export
- Trusted contacts CRUD (session only)
- Incident-note export and official India cybercrime resources
- Privacy and settings screen
- FastAPI starter endpoint that validates uploads but clearly reports that no classifier is configured

> **Important:** The voice-detection model is not implemented in this starter. Without Supabase credentials, authentication uses a local preview session. Without a trained model connected to the backend, analysis is explicitly marked as demo-only. Do not use this starter to make real fraud determinations.

## Requirements

- Node.js 18+
- Python 3.10+ (only for the API)

## Start the frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell environment-file copy:

```powershell
Copy-Item .env.example .env
```

Open the Vite URL printed in the terminal, usually http://localhost:5173.

## Enable Supabase authentication

1. Create a project at https://supabase.com/.
2. In **Project Settings → API**, copy the Project URL and publishable/anon key.
3. Put them in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_URL=http://localhost:8000
```

4. In Supabase Authentication settings, configure the site URL and redirect URLs for your local development URL and deployed domain.
5. Restart the Vite dev server after changing `.env`.

Never place a Supabase `service_role` key in frontend environment variables. The frontend only uses the publishable/anon key. For production, configure row-level security (RLS) policies for every user-owned table.

## Start the backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Check http://localhost:8000/health.

## Recommended next steps

1. Connect Supabase user profile, contacts, incidents, and analysis metadata tables with RLS.
2. Add a real, evaluated anti-spoofing model and inference tests.
3. Add authentication/JWT verification to protected API endpoints.
4. Add file duration validation, rate limiting, structured logs without audio content, and abuse protection.
5. Design consent-first live audio capture; browser upload does not provide native phone-call monitoring.
6. Add automated frontend and backend tests before deployment.

## Stack

React · TypeScript · Vite · Tailwind CSS · Supabase Auth · FastAPI · Python
