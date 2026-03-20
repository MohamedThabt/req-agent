# ReqAgent

AI-powered requirements gathering workspace for turning raw product ideas into structured, trackable software requirements through guided conversation.

ReqAgent combines a FastAPI backend and a React + TypeScript frontend to support:
- intelligent question sequencing
- requirement lifecycle and confidence tracking
- document-assisted requirement discovery (PDF/image-oriented workflow)
- transparent agent runtime phases for user trust

## Project Snapshot

- Project type: AI-assisted requirements engineering tool
- Monorepo layout: backend API + frontend web app
- Primary audiences: contributors and portfolio reviewers

## Key Capabilities

- Guided, contextual questioning across business, functional, technical, and non-functional categories
- Requirement lifecycle state management (`not_started`, `in_progress`, `completed`, `blocked`, clarification/follow-up states)
- Confidence scoring to represent answer quality and completeness
- Agent phase visibility (`planning`, `asking`, `evaluating`, `processing_documents`, `updating_progress`, `finalizing`)
- Document workflow support for PDF/image-based requirement extraction paths

## Tech Stack

### Backend

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic + pydantic-settings
- LangChain Google GenAI + text splitters
- HTTPX

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Mermaid
- Radix UI + utility libraries

## Repository Structure

```text
req-agent/
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- app/
|   |-- config/
|   |-- database/
|   |-- routes/
|   `-- logs/
|-- frontend/
|   |-- package.json
|   |-- src/
|   `-- public/
`-- Docs/
    `-- requirements.md
```

## Prerequisites

Install the following before running locally:

- Python 3.10 or newer
- Node.js 20 or newer (recommended for modern Vite versions)
- npm 10 or newer
- A Google Gemini API key

## Quick Start

Open two terminals from the repository root.

1. Start backend API
2. Start frontend app

### 1) Backend setup and run

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
APP_GOOGLE_API_KEY=your_google_gemini_api_key
APP_APP_ENV=development
APP_LOG_LEVEL=INFO
APP_GEMINI_MODEL=gemini-3-flash-preview
```

Run backend:

```powershell
fastapi dev main.py
```

Backend endpoints:
- API base: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2) Frontend setup and run

```powershell
cd frontend
npm install
npm run dev
```

Frontend app:
- Local URL (assumed default): `http://127.0.0.1:5173`

Note on assumption: `5173` is Vite's default dev port. This repository does not currently override the port in Vite config.

## Detailed Local Development

### Backend notes

- Entry point: `backend/main.py`
- Current health endpoint:
  - `GET /` returns `{ "message": "API is running" }`
- App configuration is loaded from environment variables with `APP_` prefix via `backend/config/settings.py`

### Frontend notes

- Scripts are defined in `frontend/package.json`
- Available commands:
  - `npm run dev` - run Vite dev server
  - `npm run build` - Type-check then production build
  - `npm run lint` - run ESLint
  - `npm run preview` - preview production build
- Alias `@` maps to `frontend/src`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_GOOGLE_API_KEY` | Yes | empty | Google Gemini API key |
| `APP_APP_ENV` | No | `development` | Runtime environment |
| `APP_LOG_LEVEL` | No | `INFO` | Logging level |
| `APP_GEMINI_MODEL` | No | `gemini-3-flash-preview` | Gemini model name |
| `APP_APP_NAME` | No | `ReqAgent` | Application display name |
| `APP_APP_VERSION` | No | `1.0.0` | Application version |

### Frontend

No dedicated frontend `.env` contract is currently documented in this repository.
If you introduce backend API URL variables later, document them here to keep root onboarding complete.

## Typical Development Workflow

1. Start backend in one terminal from `backend/`.
2. Start frontend in another terminal from `frontend/`.
3. Open frontend app in browser.
4. Verify backend health and API docs at `/docs`.
5. Iterate on UI and API in parallel.

## Troubleshooting

- `fastapi: command not found`
  - Ensure virtual environment is activated and dependencies installed in `backend/`.

- Backend starts but Gemini features fail
  - Verify `APP_GOOGLE_API_KEY` is set correctly in `backend/.env`.

- Frontend cannot connect to backend
  - Confirm backend is running on `127.0.0.1:8000`.
  - Check frontend network requests and base URL handling in client code.

- Port conflicts
  - Use Vite's `--port` flag for frontend and adjust backend host/port if needed.

## Current Status and Scope

This repository already includes strong foundational structure for both backend and frontend, with rich UI scaffolding for requirement tracking and agent-state visualization.

Some modules and route areas appear prepared for expansion, so expect ongoing implementation in:
- `backend/routes/`
- `backend/database/`
- integration paths between frontend chat flows and backend endpoints

## Supporting Docs

- Product intent and functional direction: `Docs/requirements.md`
- Backend-focused guide: `backend/README.md`
- Frontend starter guide (template-based): `frontend/README.md`

## License

Internal project.
