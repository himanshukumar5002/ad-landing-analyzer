from langchain_core.prompts import PromptTemplate

# Prompt instructions
ANALYSIS_PROMPT_TEMPLATE = """You are a senior Conversion Rate Optimization (CRO) and Digital Marketing consultant.
Your objective is to compare an Advertisement (text or OCR extracted text) against a Scraped Landing Page to analyze their "fit" (alignment and continuity).

Here is the Advertisement copy:
-----------------------------------------
{ad_text}
-----------------------------------------

Here is the structured content scraped from the Landing Page:
-----------------------------------------
{landing_page_json}
-----------------------------------------

Analyze the alignment and continuity between the Ad and the Landing Page across the following categories:
1. Overall Match Score: General evaluation of how well the landing page matches the ad expectations.
2. Persona Match: Does the landing page target the same audience/persona as the ad?
3. Offer Match: Does the offer, deal, or promotion promised in the ad exist on the landing page?
4. Headline Continuity: Does the heading of the landing page continue the narrative or phrasing of the ad?
5. Visual Continuity: Does the description or imagery match the visual cues implied in the ad?
6. CTA Consistency: Do the landing page buttons match the action/expectations of the ad's call-to-action?
7. Trust Signals: Does the landing page have security seals, checkout trust cues, or guarantees?
8. Social Proof: Are there testimonials, ratings, or reviews backing the ad's claims?
9. Pricing Consistency: Is the pricing, discount, or payment terms consistent with the ad?
10. Benefits Match: Do the benefits highlighted in the ad map directly to the landing page benefits?
11. Objection Handling: Does the landing page address common user objections (FAQ, refund policies)?
12. Shipping Visibility: Is shipping time/cost clearly visible if promised in the ad?
13. Above-the-Fold Experience: Is the core ad promise immediately visible above-the-fold on the landing page?
14. Brand Messaging: Is the tone, brand voice, and brand positioning consistent?
15. Product Positioning: Is the product described and framed the same way as in the ad?
16. Urgency Match: Is the urgency (e.g., "Today Only", "Limited Stock") consistent and validated on the page?

CRITICAL INSTRUCTIONS:
- Use EVIDENCE from the provided texts only. Do not hallucinate or make assumptions.
- If information is missing, explicitly say "Missing" in the evidence and score it accordingly.
- Every category must have a 'score' (0-100), 'confidence' (0.0 to 1.0), 'evidence' (explaining the score), and 'recommendation' (how to improve the match).
- Generate exactly the top 5 improvements/recommendations for the landing page to better align with the ad.
- Rank the top 5 recommendations by Priority (High, Medium, Low), Business Impact (High, Medium, Low), and Effort (High, Medium, Low).
- You must return valid JSON ONLY. Do not write any explanations before or after the JSON, and do not wrap it in markdown block tags.

{format_instructions}
"""

ANALYSIS_PROMPT = PromptTemplate(
    template=ANALYSIS_PROMPT_TEMPLATE,
    input_variables=["ad_text", "landing_page_json"],
    partial_variables={"format_instructions": ""}
)


# Prompt instructions for multiple ads clustering (bonus feature)
MULTIPLE_ADS_PROMPT_TEMPLATE = """You are a senior Conversion Rate Optimization (CRO) consultant.
You are given a list of advertisements that drive traffic to a single landing page.
Your task is to:
1. Cluster the advertisements into distinct marketing angles (e.g., Price, Luxury, Speed, Quality, Eco-Friendly, etc.).
2. Generate landing page recommendations and tailored improvements for each cluster to improve conversion rates.

Here are the Advertisement copies:
-----------------------------------------
{ads_list}
-----------------------------------------

Here is the structured content scraped from the Landing Page:
-----------------------------------------
{landing_page_json}
-----------------------------------------

Please perform the clustering and generate custom landing page optimization strategies for each cluster.
Return the output in a clean, structured JSON format with this exact shape:

{{
  "clusters": [
    {{
      "angle": "Marketing Angle Name (e.g. Price, Luxury)",
      "ad_indexes": [0, 1],
      "ad_texts": ["...", "..."],
      "analysis": "Analysis of how this angle aligns or mismatches with the landing page.",
      "overall_fit_score": 75,
      "recommendations": [
        {{
          "title": "Recommendation Title",
          "description": "Details",
          "impact": "High",
          "effort": "Low",
          "priority": "High"
        }}
      ]
    }}
  ]
}}

Return valid JSON only. Do not wrap the JSON in markdown code blocks.
"""

MULTIPLE_ADS_PROMPT = PromptTemplate(
    template=MULTIPLE_ADS_PROMPT_TEMPLATE,
    input_variables=["ads_list", "landing_page_json"]
)
