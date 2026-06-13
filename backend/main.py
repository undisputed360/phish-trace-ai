from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
from feature_extractor import extract_features_as_list, extract_features, get_feature_names
from llm_service import generate_explanation, analyze_email_headers

app = FastAPI(
    title="PhishTrace AI",
    description="AI-powered phishing URL detection with LLM explanations",
    version="2.0.0"
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

class EmailRequest(BaseModel):
    headers_text: str

class AnalysisResponse(BaseModel):
    url: str
    risk_score: float
    is_suspicious: bool
    explanation: str
    action: str
    ai_generated: bool
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
        flagged.append("High ratio of digits to letters (looks random/generated)")
    if features_dict.get('subdomain_count', 0) > 3:
        flagged.append(f"Excessive subdomains ({features_dict['subdomain_count']})")
    if features_dict.get('uses_https', 0) == 0:
        flagged.append("Does not use HTTPS (not secure)")

    return flagged


@app.get("/")
def root():
    return {
        "message": "PhishTrace AI API is running",
        "status": "healthy",
        "model_loaded": model is not None,
        "version": "2.0.0"
    }


@app.post("/analyze")
def analyze_url(request: URLRequest):
    url = request.url

    if model is None:
        return {
            "url": url,
            "risk_score": 0,
            "is_suspicious": False,
            "explanation": "Model not loaded. Run train_model.py first.",
            "action": "Cannot analyze without model.",
            "ai_generated": False,
            "flagged_features": []
        }

    # Extract features
    features_dict = extract_features(url)
    features_list = extract_features_as_list(url)

    # ML Prediction
    probability = model.predict_proba([features_list])[0]
    risk_score = round(probability[1] * 100, 1)
    prediction = model.predict([features_list])[0]
    is_suspicious = bool(prediction == 1)

    # Get flagged features
    flagged = get_flagged_features(features_dict)

    # Get AI explanation
    llm_result = generate_explanation(
        url=url,
        risk_score=risk_score,
        is_suspicious=is_suspicious,
        flagged_features=flagged,
        features_dict=features_dict
    )

    return {
        "url": url,
        "risk_score": risk_score,
        "is_suspicious": is_suspicious,
        "explanation": llm_result["explanation"],
        "action": llm_result["action"],
        "ai_generated": llm_result["ai_generated"],
        "flagged_features": flagged
    }


@app.post("/analyze-email")
def analyze_email(request: EmailRequest):
    """Analyze all URLs found in email headers and body."""
    result = analyze_email_headers(request.headers_text)
    return result


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }