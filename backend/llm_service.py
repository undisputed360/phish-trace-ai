import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_explanation(url, risk_score, is_suspicious, flagged_features, features_dict):
    """
    Generate an AI-powered explanation of the phishing analysis results.
    Returns a plain-English explanation and a recommended action.
    """
    
    # Build context for the LLM
    risk_level = "HIGH" if risk_score >= 70 else "MEDIUM" if risk_score >= 30 else "LOW"
    
    flagged_text = ""
    if flagged_features:
        flagged_text = "Suspicious indicators found:\n"
        for f in flagged_features:
            flagged_text += f"- {f}\n"
    else:
        flagged_text = "No specific suspicious indicators found.\n"
    
    url_details = f"""
URL: {url}
Risk Score: {risk_score}%
Risk Level: {risk_level}
Verdict: {"PHISHING" if is_suspicious else "LEGITIMATE"}
URL Length: {features_dict.get('url_length', 'N/A')}
Uses HTTPS: {'Yes' if features_dict.get('uses_https') else 'No'}
Domain Length: {features_dict.get('domain_length', 'N/A')}
Subdomains: {features_dict.get('subdomain_count', 'N/A')}
Has IP Address: {'Yes' if features_dict.get('has_ip') else 'No'}
Suspicious TLD: {'Yes' if features_dict.get('suspicious_tld') else 'No'}
Contains @ Symbol: {'Yes' if features_dict.get('at_count', 0) > 0 else 'No'}
Suspicious Keywords: {features_dict.get('suspicious_keywords', 0)}
Digit/Letter Ratio: {features_dict.get('digit_letter_ratio', 0):.2f}
"""
    
    prompt = f"""You are a cybersecurity expert explaining phishing detection results to a non-technical user.

Analyze this URL scan result and provide:
1. A clear, simple explanation (2-3 sentences) of why this URL is safe or suspicious
2. A short recommended action (1 sentence)

{url_details}

{flagged_text}

Format your response exactly like this:
EXPLANATION: [your 2-3 sentence explanation]
ACTION: [your 1 sentence action recommendation]"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert. Always respond in the exact format requested. Keep explanations simple and actionable."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        raw_output = response.choices[0].message.content.strip()
        
        # Parse the response
        explanation = ""
        action = ""
        
        for line in raw_output.split('\n'):
            if line.startswith('EXPLANATION:'):
                explanation = line.replace('EXPLANATION:', '').strip()
            elif line.startswith('ACTION:'):
                action = line.replace('ACTION:', '').strip()
        
        # Fallback if parsing fails
        if not explanation:
            explanation = raw_output
        if not action:
            if is_suspicious:
                action = "Do not click any links or enter personal information on this page."
            else:
                action = "This URL appears safe to visit."
        
        return {
            "explanation": explanation,
            "action": action,
            "ai_generated": True
        }
        
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback to rule-based explanation
        return generate_fallback_explanation(url, risk_score, is_suspicious, flagged_features)


def generate_fallback_explanation(url, risk_score, is_suspicious, flagged_features):
    """Fallback rule-based explanation when LLM is unavailable."""
    
    if is_suspicious:
        if risk_score >= 90:
            explanation = f"This URL is highly likely to be a phishing attempt. Multiple suspicious indicators were detected."
        elif risk_score >= 70:
            explanation = f"This URL shows strong signs of being a phishing page with several concerning characteristics."
        else:
            explanation = f"This URL has some suspicious characteristics that warrant caution."
        
        if flagged_features:
            action = f"Warning: {flagged_features[0]}. Do not enter personal information."
        else:
            action = "Exercise caution. Do not enter sensitive information on this site."
    else:
        if risk_score <= 10:
            explanation = "This URL appears to be legitimate with no suspicious indicators detected."
        elif risk_score <= 30:
            explanation = "This URL is likely safe, with only minor characteristics that are common in legitimate websites."
        else:
            explanation = "This URL is probably safe, though it has a few unusual traits."
        action = "This URL appears safe to visit."
    
    return {
        "explanation": explanation,
        "action": action,
        "ai_generated": False
    }


def analyze_email_headers(headers_text):
    """
    Extract and analyze all URLs from raw email headers + body.
    Returns a list of analyzed URLs.
    """
    import re
    
    # Extract all URLs from the text
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(url_pattern, headers_text)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    if not unique_urls:
        return {
            "urls_found": 0,
            "analyzed_urls": [],
            "summary": "No URLs found in the provided text."
        }
    
    # Analyze each URL
    from feature_extractor import extract_features, extract_features_as_list
    import pickle
    import os
    
    # Load model
    model_path = os.path.join(os.path.dirname(__file__), "phish_model.pkl")
    model = None
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
    except:
        pass
    
    analyzed = []
    suspicious_count = 0
    
    for url in unique_urls[:20]:  # Limit to 20 URLs
        features_dict = extract_features(url)
        
        if model:
            features_list = extract_features_as_list(url)
            probability = model.predict_proba([features_list])[0]
            risk_score = round(probability[1] * 100, 1)
            is_suspicious = bool(model.predict([features_list])[0] == 1)
        else:
            risk_score = 0
            is_suspicious = False
        
        if is_suspicious:
            suspicious_count += 1
        
        analyzed.append({
            "url": url,
            "risk_score": risk_score,
            "is_suspicious": is_suspicious
        })
    
    # Sort by risk score (highest first)
    analyzed.sort(key=lambda x: x['risk_score'], reverse=True)
    
    if suspicious_count == 0:
        summary = f"Found {len(unique_urls)} URL(s). All appear safe."
    elif suspicious_count == len(unique_urls):
        summary = f"Found {len(unique_urls)} URL(s). ALL are suspicious! This email is likely a phishing attempt."
    else:
        summary = f"Found {len(unique_urls)} URL(s). {suspicious_count} appear suspicious."
    
    return {
        "urls_found": len(unique_urls),
        "analyzed_urls": analyzed,
        "suspicious_count": suspicious_count,
        "summary": summary
    }