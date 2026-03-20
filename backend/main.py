from fastapi import FastAPI

from config.settings import settings
from config.logger import setup_logging
from config.middleware import RequestLoggingMiddleware
from config.exceptions import register_exception_handlers

setup_logging()

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(RequestLoggingMiddleware)
register_exception_handlers(app)


@app.get("/")
def read_root():
    return {"message": "API is running"}
