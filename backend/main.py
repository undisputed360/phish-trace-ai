from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

class URLRequest(BaseModel):
    url: str

@app.get("/")
def root():
    return {"message": "PhishTrace AI API is running", "status": "healthy"}

@app.post("/analyze")
def analyze_url(request: URLRequest):
    return {
        "url": request.url,
        "risk_score": 0.0,
        "is_suspicious": False,
        "explanation": "Analysis engine coming soon.",
        "flagged_features": []
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}