# ARGUS - AI Cyber Decision Intelligence Platform

ARGUS is a modern SOC Decision Intelligence and Threat Mitigation platform designed for Critical National Infrastructure (CNI). It integrates real-time node topology, automated playbooks, email delivery reporting, and dual AI-reasoning capabilities.

---

## Required Environment Variables

All integrations must be configured using environment variables inside the `.env` file. You can copy the placeholders from `.env.example`.

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes (Fails startup if missing) |
| `JWT_SECRET_KEY` | HS256 JWT signature secret key | Yes (Fails startup if missing) |
| `JWT_ALGORITHM` | Encryption algorithm (e.g., `HS256`) | Yes (Defaults to `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity time in minutes | Yes (Defaults to `60`) |
| `SUPABASE_URL` | Supabase Project API URL | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative bypass key | Optional |
| `TELEGRAM_BOT_TOKEN` | Token for the Telegram dispatch channel bot | Optional |
| `TELEGRAM_CHAT_ID` | Telegram Chat / Group ID for critical alert streams | Optional |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API Key (AI Fallback provider) | Optional |
| `RESEND_API_KEY` | Resend API Key for SOC email reports delivery | Optional |
| `EMAIL_FROM` | Sender address (e.g., `onboarding@resend.dev`) | Optional |

---

## Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js v18+

### 2. Backend Installation & Start
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend Installation & Start
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## Production Setup

### 1. Build Frontend Assets
Compile static files inside the frontend workspace:
```bash
cd frontend
npm run build
```

### 2. Run Backend Production Gateway
Serve FastAPI via Uvicorn in production mode:
```bash
cd backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Integration Guides

### Supabase
Set `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` inside `.env` to connect directly to your remote live Postgres cluster and run schema migrations automatically.

### Resend Email
Provide `RESEND_API_KEY` and set `EMAIL_FROM`. During sandbox development, Resend restricts delivery to the verified account email or the `onboarding@resend.dev` sender. Non-configured keys disable report delivery gracefully.

### Gemini & OpenRouter AI Fallback
Provide `GEMINI_API_KEY` to enable decision reasoning. If Gemini encounters rate limits or quota errors, the AI Service provider abstraction automatically retries the prompt using `OPENROUTER_API_KEY` with `google/gemini-2.5-flash` model. If both keys are missing, AI features are disabled gracefully on the frontend.

### Telegram
Register your Telegram bot via BotFather, set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. High/Critical level alert streams will automatically be dispatched directly to your channel group.
