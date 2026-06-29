import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.models import OCRResponse
from app.services.ocr_service import OCRService

router = APIRouter()

@router.post("/upload-image", response_model=OCRResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Receives an image, performs OCR text extraction, and parses key details.
    """
    # Verify file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image.")

    try:
        # Create a temp file inside the workspace
        # Note: Do not write to system tmp if possible, let's use a subdirectory inside the workspace.
        workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        temp_dir = os.path.join(workspace_dir, "temp_uploads")
        os.makedirs(temp_dir, exist_ok=True)
        
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(dir=temp_dir, delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        try:
            print(f"Executing OCR on file: {file.filename}")
            # Perform OCR and extract elements
            ocr_result = OCRService.extract_text_from_image(temp_path)
            return ocr_result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"OCR Text extraction failed: {str(e)}"
        )
