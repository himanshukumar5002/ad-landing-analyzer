import os
import pytesseract
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Returns API server status, including status of external dependencies.
    """
    openai_configured = bool(os.getenv("OPENAI_API_KEY") and not os.getenv("OPENAI_API_KEY").startswith("your_openai"))
    firecrawl_configured = bool(os.getenv("FIRECRAWL_API_KEY") and not os.getenv("FIRECRAWL_API_KEY").startswith("your_firecrawl"))
    
    tesseract_available = False
    try:
        pytesseract.get_tesseract_version()
        tesseract_available = True
    except Exception:
        pass

    return {
        "status": "healthy",
        "version": "1.0.0",
        "dependencies": {
            "openai_api": "configured" if openai_configured else "missing (using mock fallback)",
            "firecrawl_api": "configured" if firecrawl_configured else "missing (using BS4 fallback)",
            "tesseract_ocr": "available" if tesseract_available else "missing (using heuristic mock fallback)"
        }
    }
