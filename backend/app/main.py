# AdMatch.ai - FastAPI Backend Server
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environmental variables
load_dotenv()

# Import routes
from app.routes import health, ocr, analyze

app = FastAPI(
    title="Ad-to-Landing Page Fit Analyzer API",
    description="Backend API evaluating messaging alignment between advertisements and landing pages.",
    version="1.0.0"
)

# CORS configurations
# React standard development ports: 5173, 3000
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For ease of local dev and deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Ad-to-Landing Page Fit Analyzer API. Access documentation at /docs"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
