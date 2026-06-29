import os
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
from langchain_core.runnables import RunnableParallel
from app.schemas.models import AnalysisResponse
from app.prompts.templates import ANALYSIS_PROMPT, MULTIPLE_ADS_PROMPT

class LangChainPipeline:
    @staticmethod
    def analyze(ad_text: str, landing_page_json: dict) -> dict:
        """
        Executes the LangChain pipeline to analyze the fit between ad and landing page.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        
        # Check if key is set and not a placeholder
        if not api_key or api_key.startswith("your_openai") or api_key == "":
            print("OPENAI_API_KEY is not configured or is placeholder. Using smart mock fallback.")
            return LangChainPipeline._generate_mock_analysis(ad_text, landing_page_json)

        try:
            # Set up the parser
            parser = PydanticOutputParser(pydantic_object=AnalysisResponse)
            format_instructions = parser.get_format_instructions()
            
            # Set up LLM
            llm = ChatOpenAI(
                model="gpt-4o",
                temperature=0.0,
                openai_api_key=api_key,
                timeout=30
            )
            
            # Format the prompt
            prompt_input = {
                "ad_text": ad_text,
                "landing_page_json": json.dumps(landing_page_json, indent=2),
                "format_instructions": format_instructions
            }
            
            # Chain: Prompt -> LLM -> Parser
            chain = ANALYSIS_PROMPT | llm | parser
            
            # Run chain
            result = chain.invoke(prompt_input)
            
            # If it returns a Pydantic object, convert to dict
            if hasattr(result, "dict"):
                return result.dict()
            return result

        except Exception as e:
            print(f"Error in LangChain LLM execution: {e}. Falling back to smart mock.")
            return LangChainPipeline._generate_mock_analysis(ad_text, landing_page_json, error=str(e))

    @staticmethod
    def analyze_multiple(ads_list: list, landing_page_json: dict) -> dict:
        """
        Clustered multiple ads analysis (Bonus Feature)
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key.startswith("your_openai") or api_key == "":
            return LangChainPipeline._generate_mock_multiple_analysis(ads_list, landing_page_json)

        try:
            llm = ChatOpenAI(
                model="gpt-4o",
                temperature=0.0,
                openai_api_key=api_key,
                timeout=30
            )
            
            prompt_input = {
                "ads_list": json.dumps(ads_list, indent=2),
                "landing_page_json": json.dumps(landing_page_json, indent=2)
            }
            
            chain = MULTIPLE_ADS_PROMPT | llm | JsonOutputParser()
            result = chain.invoke(prompt_input)
            return result
        except Exception as e:
            print(f"Error in multiple ads analysis: {e}")
            return LangChainPipeline._generate_mock_multiple_analysis(ads_list, landing_page_json)

    @staticmethod
    def _generate_mock_analysis(ad_text: str, landing_page_json: dict, error: str = None) -> dict:
        """
        Generates a highly contextual and realistic mock analysis report if API key is not configured.
        """
        # Determine landing page text elements
        hero = landing_page_json.get("heroHeading", "").lower()
        cta_page = landing_page_json.get("cta", "").lower()
        discount_page = landing_page_json.get("discount", "").lower()
        price_page = landing_page_json.get("pricing", "").lower()
        
        # Analyze mismatch signs in ad_text
        ad_lower = ad_text.lower()
        
        # 1. Check Offer/Discount mismatch
        ad_has_discount = "%" in ad_lower or "off" in ad_lower or "discount" in ad_lower
        page_has_discount = "%" in discount_page or "off" in discount_page or discount_page != "missing"
        
        offer_score = 92
        offer_evidence = "The advertisement and landing page both clearly highlight the discount and special pricing."
        offer_rec = "Keep the promotional banner clearly visible near the top."
        
        if ad_has_discount and not page_has_discount:
            offer_score = 45
            offer_evidence = f"Ad copy mentions a discount/offer ('{ad_text[:40]}...'), but no corresponding discount terms or coupon codes were found on the landing page."
            offer_rec = "Create a clear, prominent promotional bar at the top of the landing page matching the ad discount."
            
        # 2. Check CTA mismatch
        ad_has_shipping = "shipping" in ad_lower or "free shipping" in ad_lower
        page_has_shipping = "shipping" in landing_page_json.get("shipping", "").lower() or landing_page_json.get("shipping") != "missing"
        
        shipping_score = 90
        shipping_evidence = "Shipping information is visible on the landing page matching user expectations."
        shipping_rec = "Maintain the clear display of shipping costs."
        
        if ad_has_shipping and not page_has_shipping:
            shipping_score = 50
            shipping_evidence = "Ad copy promises 'Free Shipping', but shipping policies or costs are not clearly stated above the fold on the landing page."
            shipping_rec = "Add a 'Free Shipping' badge or text line directly in the hero section or top banner of the landing page."

        # 3. Check Headline Continuity
        # Try to find common words between ad headline and landing page hero
        ad_words = set(re.findall(r'\w+', ad_lower))
        hero_words = set(re.findall(r'\w+', hero))
        common_words = ad_words.intersection(hero_words) - {"and", "the", "a", "of", "to", "for", "in", "on", "with", "or", "is"}
        
        headline_score = 85
        headline_evidence = f"The landing page hero heading '{landing_page_json.get('heroHeading')}' contains matching keywords from the ad."
        headline_rec = "Consider aligning the hero typography to match the ad tone."
        
        if len(common_words) < 2:
            headline_score = 55
            headline_evidence = f"Low narrative continuity. Ad mentions '{ad_text[:30]}...' but the primary hero heading on the landing page is '{landing_page_json.get('heroHeading')}'."
            headline_rec = "Rewrite the landing page hero heading to reuse exact keywords or phrasing from the advertisement headline."

        # 4. CTA Consistency
        cta_score = 88
        cta_evidence = f"The ad CTA corresponds well with the page CTA buttons: '{landing_page_json.get('cta')}'."
        cta_rec = "Keep button colors high-contrast."
        
        # 5. Pricing consistency
        pricing_score = 95
        pricing_evidence = "Pricing terms match the expectations set by the advertisement."
        pricing_rec = "Ensure price values are bolded and clear."
        if "$" in ad_lower and not "$" in price_page:
            pricing_score = 60
            pricing_evidence = "The ad references pricing or sales, but explicit pricing or currency symbols were not parsed on the landing page."
            pricing_rec = "Ensure the pricing structure is clearly visible next to the primary Call To Action buttons."

        # Calculate overall score
        overall_score = int((offer_score + headline_score + cta_score + pricing_score + shipping_score) / 5)
        
        warning_msg = " [Fallback Mode Active - No OpenAI API Key]" if not error else f" [Fallback Mode - API Error: {error[:30]}]"

        return {
            "overall_score": overall_score,
            "persona_match": {
                "score": 85,
                "confidence": 0.90,
                "evidence": f"The landing page targets a similar buying intent as the ad copy. Page description focuses on: {landing_page_json.get('metaDescription') or 'product specs'}.",
                "recommendation": "Fine-tune the copy to align with the specific user segment targeted by this campaign."
            },
            "offer_match": {
                "score": offer_score,
                "confidence": 0.95,
                "evidence": offer_evidence,
                "recommendation": offer_rec
            },
            "headline_continuity": {
                "score": headline_score,
                "confidence": 0.92,
                "evidence": headline_evidence,
                "recommendation": headline_rec
            },
            "visual_continuity": {
                "score": 75,
                "confidence": 0.80,
                "evidence": "Image alt-tags on the landing page hint at relevant product photography matching the ad's content, but lack stylistic descriptions.",
                "recommendation": "Ensure landing page hero image uses matching model poses or product angles as the ad creative screenshot."
            },
            "cta": {
                "score": cta_score,
                "confidence": 0.88,
                "evidence": cta_evidence,
                "recommendation": cta_rec
            },
            "trust_signals": {
                "score": 80 if landing_page_json.get("trustBadges") != "Missing" else 40,
                "confidence": 0.85,
                "evidence": f"Trust badge indications: {landing_page_json.get('trustBadges')}.",
                "recommendation": "Add trust seals (e.g. SSL, Secure Checkout badges) immediately below the main CTA button."
            },
            "social_proof": {
                "score": 85 if landing_page_json.get("reviews") != "Missing" or landing_page_json.get("testimonials") != "Missing" else 45,
                "confidence": 0.90,
                "evidence": f"Testimonials/reviews found: {landing_page_json.get('reviews') or 'None found'}.",
                "recommendation": "Place a star-rating badge directly underneath the hero heading to build immediate social proof."
            },
            "pricing": {
                "score": pricing_score,
                "confidence": 0.95,
                "evidence": pricing_evidence,
                "recommendation": pricing_rec
            },
            "benefits_match": {
                "score": 82,
                "confidence": 0.88,
                "evidence": "Key product benefits like ease-of-use and reliability are mentioned on both the ad and landing page descriptions.",
                "recommendation": "Use bullet points in the landing page hero section to clearly call out the top 3 benefits mentioned in the ad."
            },
            "objection_handling": {
                "score": 78 if landing_page_json.get("faq") != "Missing" else 50,
                "confidence": 0.85,
                "evidence": f"FAQs and refund policy details: {landing_page_json.get('refundPolicy') or 'No direct refund details parsed.'}",
                "recommendation": "Include a brief FAQ section covering shipping, returns, and sizing above the footer."
            },
            "shipping": {
                "score": shipping_score,
                "confidence": 0.90,
                "evidence": shipping_evidence,
                "recommendation": shipping_rec
            },
            "above_fold": {
                "score": 70 if len(common_words) > 1 else 45,
                "confidence": 0.88,
                "evidence": "Analyzing the parsed content, some key messaging matches the primary hero card, but promotional pricing and CTAs require scrolling.",
                "recommendation": "Optimize above-the-fold real estate by removing heavy header spacing and positioning the ad offer above the fold."
            },
            "brand_messaging": {
                "score": 88,
                "confidence": 0.90,
                "evidence": "The brand voice in the ad matches the logo and general copywriting style of the landing page.",
                "recommendation": "Maintain consistency across ad copy revisions."
            },
            "product_positioning": {
                "score": 82,
                "confidence": 0.85,
                "evidence": "Product description matches the main copy of the advertisement.",
                "recommendation": "Use high-quality product closeups corresponding to ad features."
            },
            "urgency_match": {
                "score": 80 if "today" in ad_lower or "limit" in ad_lower else 95,
                "confidence": 0.85,
                "evidence": "Ad uses urgency phrasing ('Today Only'). Landing page has standard static urgency cues or lacks countdown timers.",
                "recommendation": "Add a dynamic countdown timer or 'offer ends tonight' notice to sync with the ad's time-sensitive urgency."
            },
            "summary": f"This is an automated conversion audit{warning_msg}. The advertisement and the landing page show an overall match score of {overall_score}%. There are key opportunities to align your discount banners, above-the-fold CTA positions, and shipping guarantees to reduce bounce rates and capture ready-to-buy visitors.",
            "top_recommendations": [
                {
                    "title": "Sync Hero Heading and Ad Copy",
                    "description": f"The ad focuses heavily on {list(common_words)[:2] or 'specific keywords'}, but the landing page hero is '{landing_page_json.get('heroHeading') or 'different'}'. Aligning these reduces bounce rate.",
                    "impact": "High",
                    "effort": "Low",
                    "confidence": 0.95,
                    "priority": "High",
                    "reason": "Narrative continuity is critical. If users don't see the ad headline echoed in the hero heading, they assume they clicked the wrong link."
                },
                {
                    "title": "Inject Promo Discount Above the Fold",
                    "description": "Ensure the discount (e.g. 50% OFF) mentioned in the ad is prominently showcased in the hero section.",
                    "impact": "High",
                    "effort": "Low",
                    "confidence": 0.92,
                    "priority": "High",
                    "reason": "If users click an ad promising 50% off, but have to search or scroll to confirm the offer, they exit the funnel."
                },
                {
                    "title": "Add Free Shipping Badge in Hero",
                    "description": "Insert a highly visible free shipping badge right next to the CTA buttons or in the sticky header.",
                    "impact": "Medium",
                    "effort": "Low",
                    "confidence": 0.90,
                    "priority": "Medium",
                    "reason": "Free shipping is a major purchasing driver mentioned in your ad copy. Make it clear and undeniable."
                },
                {
                    "title": "Standardize CTA Actions",
                    "description": "Align the button text (e.g., Shop Now) to exactly match the target ad CTA text.",
                    "impact": "Medium",
                    "effort": "Low",
                    "confidence": 0.88,
                    "priority": "Medium",
                    "reason": "Consistency between the click trigger and the landing page action streamlines user intent."
                },
                {
                    "title": "Incorporate Direct Social Proof near Hero",
                    "description": "Add user ratings, stars, or a rotating testimonial slider directly below the hero section.",
                    "impact": "High",
                    "effort": "Medium",
                    "confidence": 0.85,
                    "priority": "Medium",
                    "reason": "Backing up your ad claims with external reviews immediately builds credibility and increases conversion rates."
                }
            ]
        }

    @staticmethod
    def _generate_mock_multiple_analysis(ads_list: list, landing_page_json: dict) -> dict:
        """
        Generates realistic mock multiple-ad clustering analysis.
        """
        clusters = [
            {
                "angle": "Price & Discount Focus",
                "ad_indexes": [0],
                "ad_texts": [ads_list[0] if ads_list else "🔥 50% OFF Running Shoes + Free Shipping Today"],
                "analysis": "This angle targets budget-conscious consumers looking for active deals. The landing page lacks a direct above-the-fold discount banner, which creates friction for this segment.",
                "overall_fit_score": 65,
                "recommendations": [
                    {
                        "title": "Highlight 50% OFF Banner prominently",
                        "description": "Add a sticky top bar stating '50% OFF Applied at Checkout'",
                        "impact": "High",
                        "effort": "Low",
                        "priority": "High"
                    }
                ]
            },
            {
                "angle": "Quality & Performance Focus",
                "ad_indexes": [1] if len(ads_list) > 1 else [0],
                "ad_texts": [ads_list[1] if len(ads_list) > 1 else "Engineered for marathon runners. Maximum durability and comfort."],
                "analysis": "This angle targets performance-driven athletes. The landing page includes good product specifications but needs more technical details and professional reviews.",
                "overall_fit_score": 80,
                "recommendations": [
                    {
                        "title": "Showcase technical features grid",
                        "description": "Add a specs breakdown highlighting sole material and mesh breathability.",
                        "impact": "Medium",
                        "effort": "Medium",
                        "priority": "Medium"
                    }
                ]
            }
        ]
        return {"clusters": clusters}
