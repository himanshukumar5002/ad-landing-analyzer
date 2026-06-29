from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    ad_text: str = Field(..., description="The text of the advertisement")
    landing_url: str = Field(..., description="The landing page URL to analyze")

class CategoryDetails(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Score from 0 to 100")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    evidence: str = Field(..., description="Evidence found on the page or ad")
    recommendation: str = Field(..., description="Actionable recommendation to improve fit")

class Recommendation(BaseModel):
    title: str = Field(..., description="Title of the recommendation")
    description: str = Field(..., description="Detailed explanation of the improvement")
    impact: str = Field(..., description="Business impact: High, Medium, Low")
    effort: str = Field(..., description="Estimated effort: High, Medium, Low")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level as a fraction or percentage, e.g. 0.96")
    priority: str = Field(..., description="Priority: High, Medium, Low")
    reason: str = Field(..., description="Why this recommendation is necessary based on evidence")

class AnalysisResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall match score between ad and landing page")
    
    # Specific dimensions
    persona_match: CategoryDetails = Field(..., description="Analysis of persona match")
    offer_match: CategoryDetails = Field(..., description="Analysis of offer alignment")
    headline_continuity: CategoryDetails = Field(..., description="Analysis of headline continuity")
    visual_continuity: CategoryDetails = Field(..., description="Analysis of visual continuity")
    cta: CategoryDetails = Field(..., description="Analysis of CTA consistency")
    trust_signals: CategoryDetails = Field(..., description="Analysis of trust signals")
    social_proof: CategoryDetails = Field(..., description="Analysis of social proof and reviews")
    pricing: CategoryDetails = Field(..., description="Analysis of pricing consistency")
    benefits_match: CategoryDetails = Field(..., description="Analysis of benefits matching")
    objection_handling: CategoryDetails = Field(..., description="Analysis of objection handling")
    shipping: CategoryDetails = Field(..., description="Analysis of shipping visibility and terms")
    above_fold: CategoryDetails = Field(..., description="Analysis of above-the-fold experience")
    brand_messaging: CategoryDetails = Field(..., description="Analysis of brand messaging consistency")
    product_positioning: CategoryDetails = Field(..., description="Analysis of product positioning")
    urgency_match: CategoryDetails = Field(..., description="Analysis of urgency alignment")
    
    summary: str = Field(..., description="Overall executive summary of the analysis")
    top_recommendations: List[Recommendation] = Field(..., description="Top 5 improvements sorted by priority")

class OCRResponse(BaseModel):
    extracted_text: str = Field(..., description="The complete text extracted from the image")
    headline: Optional[str] = Field(None, description="Extracted ad headline")
    subheadline: Optional[str] = Field(None, description="Extracted ad subheading")
    offer: Optional[str] = Field(None, description="Extracted promotional offer")
    cta: Optional[str] = Field(None, description="Extracted call-to-action text")
    brand: Optional[str] = Field(None, description="Extracted brand name")
    discount: Optional[str] = Field(None, description="Extracted discount details")
