# 🧠 ReqAgent - AI-Powered Requirements Gathering API

An intelligent chatbot API that helps software engineers gather, clarify, and structure software requirements through guided conversations powered by Google Gemini AI.

## 📋 Overview

**ReqAgent** transforms raw project ideas into clear, structured software requirements through an interactive AI-driven process. It asks contextual questions, manages requirement progress, tracks document evidence, and validates completeness.

### Core Features

- 🤖 **Intelligent Question Engine** - Contextual, category-based questions with follow-ups
- 📊 **Progress Tracking** - Real-time status on Business, Functional, and Technical requirements
- 🎯 **Confidence Scoring** - Track answer quality and completeness (0-100%)
- 🧭 **Intelligent Status Management** - Auto-detect question completion or need for clarification
- 📐 **Structured Output** - Generate validated requirements documents

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Google Gemini API key

### Installation

1. **Clone/Navigate to the project:**
   ```bash
   cd fastapi
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `fastapi` directory:
   ```env
   APP_GOOGLE_API_KEY=your_google_gemini_api_key_here
   APP_APP_ENV=development
   APP_LOG_LEVEL=INFO
   APP_GEMINI_MODEL=gemini-3-flash-preview
   ```

### Running the Server

Start the development server with hot-reload:

```bash
fastapi dev main.py
```

The API will be available at `http://127.0.0.1:8000`

#### API Documentation
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 📚 API Endpoints

### Health Check
- **`GET /`** - API health check
  ```bash
  curl http://127.0.0.1:8000/
  ```
  Response:
  ```json
  {
    "message": "API is running"
  }
  ```

---

## 🏗️ Project Structure

```
fastapi/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
│
├── config/
│   ├── settings.py        # App configuration & settings management
│   ├── logger.py          # Logging setup
│   ├── middleware.py      # HTTP middleware (request logging)
│   ├── exceptions.py      # Custom exception handlers
│   └── __init__.py
│
├── routes/                # API route handlers (expand here)
│   ├── questions.py       # Question management endpoints
│   ├── requirements.py    # Requirements endpoints
│   ├── documents.py       # Document upload/processing
│   └── __init__.py
│
├── database/              # Database models & operations
│   ├── models.py          # ORM models
│   └── __init__.py
│
└── logs/                  # Application logs directory
    └── app.log            # Main application log file
```

---

## 🔧 Configuration

The application uses Pydantic Settings for configuration management. Environment variables are prefixed with `APP_`:

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_APP_NAME` | `ReqAgent` | Application name |
| `APP_APP_VERSION` | `1.0.0` | Application version |
| `APP_APP_ENV` | `development` | Environment (development/production) |
| `APP_LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL) |
| `APP_GOOGLE_API_KEY` | `` | Google Gemini API key |
| `APP_GEMINI_MODEL` | `gemini-3-flash-preview` | Gemini model version |

---

## 📦 Dependencies

Key packages included:

- **FastAPI** - Modern web framework for building APIs
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **LangChain** - AI/LLM integration framework
- **Google GenAI** - Google Gemini API client
- **python-dotenv** - Environment variable management
- **httpx** - Async HTTP client

See `requirements.txt` for full dependency list.

---

## 🧪 Development

### Logging

The application includes structured JSON logging:

```python
from config.logger import get_logger

logger = get_logger()
logger.info("Custom log message", extra={"key": "value"})
```

Logs are stored in `logs/app.log` and also output to console during development.

### Exception Handling

Custom exception handlers are registered for proper error responses. Check `config/exceptions.py` for details.

### Middleware

Request logging middleware tracks all HTTP requests/responses with request IDs for distributed tracing.

---

## 🚀 Next Steps

1. **Implement Question Endpoints** - Create `/api/questions` routes for CRUD operations
2. **Build Requirement Management** - Add endpoints for requirement lifecycle management
3. **Database Setup** - Configure database models for persistence
4. **AI Integration** - Connect Google Gemini for intelligent questioning
5. **Frontend Integration** - Connect to React frontend in the `react/` directory

---

## 📝 License

Internal Project

---

## 👨‍💻 Development Notes

- Use `fastapi dev main.py` for development with hot-reload
- Check API docs at `/docs` for real-time testing
- Logs are available in `logs/app.log`
- Ensure `.env` file is created before running the server
