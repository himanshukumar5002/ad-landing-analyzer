from fastapi import APIRouter, HTTPException
from app.schemas.models import AnalyzeRequest, AnalysisResponse
from app.services.scraper import ScrapingService
from app.langchain.pipeline import LangChainPipeline
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()

class AnalyzeMultipleRequest(BaseModel):
    ad_texts: List[str] = Field(..., description="List of ad copies to cluster and analyze")
    landing_url: str = Field(..., description="The landing page URL")

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_fit(request: AnalyzeRequest):
    """
    Scrapes the landing page and performs GPT analysis on the fit between ad and landing page.
    """
    try:
        # Step 1: Scrape landing page URL
        print(f"Scraping landing page: {request.landing_url}")
        scraped_data = ScrapingService.scrape_url(request.landing_url)
        
        # Step 2: Run through LangChain LLM pipeline
        print("Running LangChain fit analysis pipeline...")
        analysis_result = LangChainPipeline.analyze(request.ad_text, scraped_data)
        
        # Ensure we return valid format matching our Pydantic model
        return analysis_result

    except Exception as e:
        print(f"Error during analysis route execution: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/analyze-multiple")
async def analyze_multiple_fit(request: AnalyzeMultipleRequest):
    """
    Clusters ads by marketing angle and provides tailored landing page recommendations (Bonus Feature).
    """
    try:
        print(f"Scraping landing page: {request.landing_url}")
        scraped_data = ScrapingService.scrape_url(request.landing_url)
        
        print("Clustering and analyzing multiple ads...")
        result = LangChainPipeline.analyze_multiple(request.ad_texts, scraped_data)
        return result
    except Exception as e:
        print(f"Error during multiple analysis route: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Multiple ad analysis failed: {str(e)}"
        )
