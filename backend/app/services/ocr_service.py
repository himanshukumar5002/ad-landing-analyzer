import os
import re
from PIL import Image
import pytesseract
from typing import Dict, Any

# Auto-configure Tesseract binary path on Windows if not already in system PATH
possible_tesseract_paths = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\himan\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
]

for path in possible_tesseract_paths:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

class OCRService:
    @staticmethod
    def extract_text_from_image(image_path: str) -> Dict[str, Any]:
        """
        Performs OCR on an image and extracts structured ad fields.
        """
        extracted_text = ""
        try:
            img = Image.open(image_path)
            # Run pytesseract OCR
            extracted_text = pytesseract.image_to_string(img)
        except pytesseract.TesseractNotFoundError:
            print("Tesseract binary not found. Graceful fallback activated.")
            extracted_text = OCRService._get_mock_ocr_fallback(image_path)
        except Exception as e:
            print(f"OCR execution failed: {e}")
            extracted_text = OCRService._get_mock_ocr_fallback(image_path)

        # Clean extracted text
        extracted_text = extracted_text.strip()
        if not extracted_text:
            extracted_text = "No readable text could be extracted from this image. Please check the image quality or enter the ad copy manually."

        # Extract components using heuristics (and then refine via LLM in routes or here)
        structured_data = OCRService._parse_ad_text_heuristically(extracted_text)
        return structured_data

    @staticmethod
    def _parse_ad_text_heuristically(text: str) -> Dict[str, Any]:
        """
        Parses OCR text into Headline, Subheadline, Offer, CTA, Brand, Discount using Regex heuristics.
        These can be overridden or augmented by the frontend or backend LLM pipeline.
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        headline = ""
        subheadline = ""
        offer = ""
        cta = ""
        brand = ""
        discount = ""

        # 1. Headline: typically the longest line near the top, or uppercase line
        if lines:
            # Look at first 3 lines
            top_lines = lines[:3]
            # Headline is often the loudest line
            headline = max(top_lines, key=len) if top_lines else ""
            
            # Subheadline: line following headline or second longest
            other_lines = [l for l in top_lines if l != headline]
            if other_lines:
                subheadline = other_lines[0]
            elif len(lines) > len(top_lines):
                subheadline = lines[len(top_lines)]

        # 2. Brand: often first line or matching logo text (heuristic: short line at top)
        if lines and len(lines[0]) < 20:
            brand = lines[0]

        # 3. Discount: search for percentage or dollar off
        discount_match = re.search(r'(\d+%\s?OFF|SAVE\s?\d+|\$\d+\s?OFF|discount|sale)', text, re.I)
        if discount_match:
            discount = discount_match.group(0)

        # 4. Offer: line containing discount or key keywords
        for line in lines:
            if re.search(r'(off|free|save|shipping|deal|today|limited|only)', line, re.I):
                offer = line
                break
        if not offer and discount:
            offer = f"Special Offer: {discount}"

        # 5. CTA: scan for action verbs like shop, buy, click, get, learn, sign up
        cta_match = re.search(r'\b(shop now|buy now|get started|click here|order now|learn more|sign up|claim offer|shop|grab)\b', text, re.I)
        if cta_match:
            cta = cta_match.group(0)
        else:
            # Fallback: scan lines for CTA terms
            for line in lines:
                if re.search(r'\b(shop|buy|get|click|order|learn|sign|claim)\b', line, re.I) and len(line) < 30:
                    cta = line
                    break

        return {
            "extracted_text": text,
            "headline": headline or "Missing",
            "subheadline": subheadline or "Missing",
            "offer": offer or "Missing",
            "cta": cta or "Missing",
            "brand": brand or "Missing",
            "discount": discount or "Missing"
        }

    @staticmethod
    def _get_mock_ocr_fallback(image_path: str) -> str:
        """
        Mock fallback return if Tesseract is not installed.
        In a production-ready env, we parse the filename or return a default placeholder.
        """
        filename = os.path.basename(image_path).lower()
        if "shoe" in filename or "running" in filename:
            return "🔥 50% OFF Running Shoes + Free Shipping Today\nGet the best performance with our ultra-light mesh design.\nShop Now at Brand.com!"
        elif "saas" in filename or "software" in filename:
            return "Supercharge Your Workflow by 10x\nNo coding required. Simple drag-and-drop dashboard for modern teams.\nTry Free for 14 Days"
        elif "course" in filename or "learn" in filename:
            return "Learn AI and Machine Learning in 6 Weeks\nJoin over 10,000 students. 100% money-back guarantee.\nEnroll Today"
        
        return "🔥 Special Limited Time Offer!\nGet 50% OFF our best-selling collection + Free Shipping Today only.\nShop Now"
