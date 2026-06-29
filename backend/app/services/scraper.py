import os
import re
import requests
from bs4 import BeautifulSoup
from typing import Dict, Any

class ScrapingService:
    @staticmethod
    def scrape_url(url: str) -> Dict[str, Any]:
        """
        Scrapes a URL. Uses Firecrawl if API key is provided, otherwise falls back to BeautifulSoup.
        """
        firecrawl_key = os.getenv("FIRECRAWL_API_KEY")
        if firecrawl_key and firecrawl_key != "your_firecrawl_api_key_here":
            try:
                return ScrapingService._scrape_with_firecrawl(url, firecrawl_key)
            except Exception as e:
                print(f"Firecrawl scraping failed, falling back to BeautifulSoup: {e}")
                
        return ScrapingService._scrape_with_bs4(url)

    @staticmethod
    def _scrape_with_firecrawl(url: str, api_key: str) -> Dict[str, Any]:
        """
        Uses Firecrawl API to extract structured landing page data.
        """
        # To avoid external package dependency bugs or version mismatches, we call the Firecrawl API directly via requests.
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Firecrawl scrape endpoint
        scrape_url = "https://api.firecrawl.dev/v1/scrape"
        payload = {
            "url": url,
            "formats": ["markdown", "html"]
        }
        
        response = requests.post(scrape_url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        
        res_data = response.json()
        if not res_data.get("success"):
            raise Exception(f"Firecrawl error: {res_data.get('error', 'Unknown error')}")
            
        html_content = res_data.get("data", {}).get("html", "")
        # Parse the returned HTML using BeautifulSoup to get the required structured components
        return ScrapingService._parse_html(html_content, url)

    @staticmethod
    def _scrape_with_bs4(url: str) -> Dict[str, Any]:
        """
        Scrapes using BeautifulSoup and requests.
        """
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        
        # Ensure scheme is present
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        return ScrapingService._parse_html(response.text, url)

    @staticmethod
    def _parse_html(html_content: str, url: str) -> Dict[str, Any]:
        """
        Extracts structured fields from HTML content using BeautifulSoup.
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove scripts, styles, inputs, etc. to clean up text searches
        for script in soup(["script", "style", "input", "textarea", "iframe", "noscript"]):
            script.decompose()
            
        # 1. Title
        title = soup.title.string.strip() if soup.title else ""
        
        # 2. Hero Heading (First visible H1 or H2)
        h1s = [h.get_text().strip() for h in soup.find_all('h1') if h.get_text().strip()]
        hero_heading = h1s[0] if h1s else ""
        
        # 3. Subheading (Second H1 or H2/H3 elements near hero, or first H2)
        h2s = [h.get_text().strip() for h in soup.find_all('h2') if h.get_text().strip()]
        subheading = ""
        if len(h1s) > 1:
            subheading = h1s[1]
        elif h2s:
            subheading = h2s[0]
            
        # 4. CTA Buttons
        ctas = []
        # Find buttons and links styled like buttons or with role=button
        button_elements = soup.find_all(['button', 'a'], class_=re.compile(r'btn|button|cta|action|submit|primary', re.I))
        button_elements += soup.find_all(['button', 'a'], role='button')
        
        for elem in button_elements:
            text = elem.get_text().strip()
            if text and len(text) < 40 and text not in ctas:
                ctas.append(text)
                
        # If no button classes match, get all buttons and top 3 links in header/hero
        if not ctas:
            for btn in soup.find_all('button'):
                text = btn.get_text().strip()
                if text and len(text) < 40 and text not in ctas:
                    ctas.append(text)
                    
        cta_text = ", ".join(ctas[:6]) if ctas else "No clear CTA buttons found."

        # 5. Meta Description
        meta_desc = ""
        desc_meta = soup.find('meta', attrs={'name': re.compile(r'^description$', re.I)})
        if desc_meta and desc_meta.get('content'):
            meta_desc = desc_meta.get('content').strip()

        # Helper to find text matching patterns
        body_text = soup.get_text()
        
        # 6. Pricing & Discounts
        pricing_matches = re.findall(r'(?:\$\d+(?:\.\d{2})?|\d+\s?USD|\d+\s?euros?|£\d+)', body_text)
        pricing_text = ", ".join(list(set(pricing_matches))[:5]) if pricing_matches else ""
        
        discount_matches = re.findall(r'(?:\d+%\s?OFF|save\s?\d+|discount|sale|promo)', body_text, re.IGNORECASE)
        discount_text = ", ".join(list(set(discount_matches))[:5]) if discount_matches else ""
        
        # 7. Reviews & Testimonials
        testimonials = []
        # Find elements containing testimonial-like terms
        testimonial_elems = soup.find_all(class_=re.compile(r'testimonial|review|quote|rating', re.I))
        for elem in testimonial_elems:
            text = elem.get_text().strip()
            if text and 20 < len(text) < 300 and text not in testimonials:
                testimonials.append(text)
                
        # Scrape rating/star indications
        ratings = re.findall(r'(?:\b\d(?:\.\d)?\s?/\s?5\s?stars?|\b\d\s?stars?|★★★★★|★★★★☆)', body_text, re.IGNORECASE)
        reviews_text = ", ".join(list(set(ratings))[:4]) if ratings else ""
        testimonials_text = "\n".join(testimonials[:3]) if testimonials else ""

        # 8. Shipping & Refund Policy
        shipping_terms = []
        refund_terms = []
        
        # Look for sentences or paragraphs with shipping/delivery
        for p in soup.find_all(['p', 'span', 'li', 'div']):
            text = p.get_text().strip()
            if not text or len(text) > 250:
                continue
            if re.search(r'\b(shipping|delivery|dispatch|shipped)\b', text, re.I) and text not in shipping_terms:
                shipping_terms.append(text)
            if re.search(r'\b(refund|return|guarantee|money-back|money back|satisfaction)\b', text, re.I) and text not in refund_terms:
                refund_terms.append(text)

        shipping_info = " / ".join(shipping_terms[:3]) if shipping_terms else ""
        refund_policy = " / ".join(refund_terms[:3]) if refund_terms else ""

        # 9. Trust Badges (Alt text of images or trust keywords)
        trust_badges = []
        for img in soup.find_all('img'):
            alt = img.get('alt', '').strip()
            if alt and re.search(r'(secure|guarantee|badge|trust|ssl|verisign|norton|checkout|payment|mcafee)', alt, re.I):
                if alt not in trust_badges:
                    trust_badges.append(alt)
        trust_badges_text = ", ".join(trust_badges[:5]) if trust_badges else ""
        if not trust_badges_text and re.search(r'\b(secure checkout|ssl|encryption|norton secure|mcafee secure)\b', body_text, re.I):
            trust_badges_text = "Text indicators of secure checkout / SSL detected."

        # 10. FAQ
        faq_items = []
        # Look for headers containing Q or questions, or divs with FAQ classes
        faq_sections = soup.find_all(class_=re.compile(r'faq|accordion|question', re.I))
        for section in faq_sections:
            text = section.get_text().strip()
            if text and 10 < len(text) < 150 and text not in faq_items:
                faq_items.append(text)
        faq_text = "\n".join(faq_items[:5]) if faq_items else ""

        # 11. Navigation & Footer
        nav_elements = soup.find_all(['nav', 'header'])
        nav_links = []
        for nav in nav_elements:
            for a in nav.find_all('a'):
                t = a.get_text().strip()
                if t and t not in nav_links:
                    nav_links.append(t)
                    
        footer_elements = soup.find_all(['footer', 'div'], class_=re.compile(r'footer', re.I))
        footer_links = []
        for foot in footer_elements:
            for a in foot.find_all('a'):
                t = a.get_text().strip()
                if t and t not in footer_links:
                    footer_links.append(t)

        navigation_text = ", ".join(nav_links[:8]) if nav_links else ""
        footer_text = ", ".join(footer_links[:8]) if footer_links else ""

        # 12. Images Alt Text
        all_alts = [img.get('alt').strip() for img in soup.find_all('img') if img.get('alt') and img.get('alt').strip()]
        images_alt_text = ", ".join(list(set(all_alts))[:10])

        # 13. Product Description (paragraphs with significant text)
        paragraphs = []
        for p in soup.find_all('p'):
            text = p.get_text().strip()
            if len(text) > 60 and not re.search(r'(cookie|privacy|copyright|rights reserved|agree)', text, re.I):
                paragraphs.append(text)
        product_desc = "\n\n".join(paragraphs[:5]) if paragraphs else body_text[:800].strip()

        # Compile everything into structured JSON
        return {
            "title": title or "Missing",
            "heroHeading": hero_heading or "Missing",
            "subheading": subheading or "Missing",
            "cta": cta_text or "Missing",
            "pricing": pricing_text or "Missing",
            "discount": discount_text or "Missing",
            "reviews": reviews_text or "Missing",
            "testimonials": testimonials_text or "Missing",
            "productDescription": product_desc or "Missing",
            "trustBadges": trust_badges_text or "Missing",
            "shipping": shipping_info or "Missing",
            "refundPolicy": refund_policy or "Missing",
            "faq": faq_text or "Missing",
            "navigation": navigation_text or "Missing",
            "footer": footer_text or "Missing",
            "imagesAltText": images_alt_text or "Missing",
            "metaDescription": meta_desc or "Missing"
        }
