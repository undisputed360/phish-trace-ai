from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
from feature_extractor import extract_features_as_list, extract_features, get_feature_names

app = FastAPI(
    title="PhishTrace AI",
    description="AI-powered phishing URL detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
model = None
model_path = os.path.join(os.path.dirname(__file__), "phish_model.pkl")

try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print(f"Model loaded successfully from {model_path}")
except FileNotFoundError:
    print(f"WARNING: Model file not found at {model_path}. Run train_model.py first.")
except Exception as e:
    print(f"WARNING: Failed to load model: {e}")


class URLRequest(BaseModel):
    url: str

class AnalysisResponse(BaseModel):
    url: str
    risk_score: float
    is_suspicious: bool
    explanation: str
    flagged_features: list


def get_flagged_features(features_dict):
    """Return list of features that indicate phishing."""
    flagged = []
    
    if features_dict.get('has_ip', 0) == 1:
        flagged.append("Uses IP address instead of domain name")
    if features_dict.get('url_length', 0) > 75:
        flagged.append(f"Unusually long URL ({features_dict['url_length']} characters)")
    if features_dict.get('suspicious_tld', 0) == 1:
        flagged.append("Uses suspicious top-level domain")
    if features_dict.get('at_count', 0) > 0:
        flagged.append("Contains @ symbol (possible redirect)")
    if features_dict.get('suspicious_keywords', 0) > 0:
        flagged.append(f"Contains {features_dict['suspicious_keywords']} suspicious keyword(s)")
    if features_dict.get('digit_letter_ratio', 0) > 0.5:
        flagged.append("High ratio of digits to letters")
    if features_dict.get('subdomain_count', 0) > 3:
        flagged.append(f"Excessive subdomains ({features_dict['subdomain_count']})")
    if features_dict.get('uses_https', 0) == 0:
        flagged.append("Does not use HTTPS")
    
    return flagged


@app.get("/")
def root():
    return {
        "message": "PhishTrace AI API is running",
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/analyze")
def analyze_url(request: URLRequest):
    url = request.url
    
    # Default response if model isn't loaded
    if model is None:
        return {
            "url": url,
            "risk_score": 0,
            "is_suspicious": False,
            "explanation": "Model not loaded. Run train_model.py first.",
            "flagged_features": []
        }
    
    # Extract features
    features_dict = extract_features(url)
    features_list = extract_features_as_list(url)
    
    # Predict
    probability = model.predict_proba([features_list])[0]
    risk_score = round(probability[1] * 100, 1)  # Probability of phishing
    prediction = model.predict([features_list])[0]
    is_suspicious = bool(prediction == 1)
    
    # Get flagged features
    flagged = get_flagged_features(features_dict)
    
    # Generate explanation
    if is_suspicious:
        if risk_score >= 90:
            explanation = f"This URL is highly likely to be a phishing attempt. {len(flagged)} suspicious indicators were found, including: {flagged[0].lower() if flagged else 'suspicious patterns'}."
        elif risk_score >= 70:
            explanation = f"This URL shows strong signs of being a phishing page. Key concerns: {flagged[0].lower() if flagged else 'multiple suspicious patterns'}."
        else:
            explanation = f"This URL has some suspicious characteristics. Main concern: {flagged[0].lower() if flagged else 'unusual patterns detected'}."
    else:
        if risk_score <= 10:
            explanation = "This URL appears to be legitimate. No suspicious indicators were detected."
        elif risk_score <= 30:
            explanation = "This URL is likely safe, with only minor unusual characteristics that are common in legitimate URLs."
        else:
            explanation = "This URL is probably safe, but has a few unusual traits. Exercise normal caution."
    
    return {
        "url": url,
        "risk_score": risk_score,
        "is_suspicious": is_suspicious,
        "explanation": explanation,
        "flagged_features": flagged
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }