# req-agent

Monorepo for the Req Agent project.

## Structure

```
req-agent/
├── react/          # React chat agent UI (Vite + shadcn/ui)
└── README.md
```

> If you have an old `react-app` folder from before the monorepo rename, remove it manually (`rm -rf react-app` on Unix, or delete the folder in File Explorer on Windows).

## Setup

### React (Chat Agent UI)

1. Install dependencies:
   ```bash
   cd react
   pnpm install
   ```

2. Copy the environment example and configure:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `VITE_API_URL` to your FastAPI backend URL (default: `http://localhost:8000`).

3. Start the development server:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:5173/` (or another port if 5173 is in use).

4. Build for production:
   ```bash
   pnpm build
   ```
