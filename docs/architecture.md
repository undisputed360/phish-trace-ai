# PhishTrace AI — Architecture

## System Overview

┌─────────────────────────────────────────────────────────────┐
│ USERS │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Web Browser │ │ Chrome │ │ API Client │ │
│ │ (React App) │ │ Extension │ │ (REST) │ │
│ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼────────────┘
│ │ │
│ HTTPS │ HTTPS │ HTTPS
▼ ▼ ▼
┌─────────────────────────────────────────────────────────────┐
│ VERCEL (Frontend) │
│ React + Vite + TailwindCSS │
│ │
│ Pages: │
│ • URL Scanner (/) │
│ • Email Analyzer (/email) │
│ • Threat Feed (/feed) │
└──────────────────────────┬──────────────────────────────────┘
│ API Calls
▼
┌─────────────────────────────────────────────────────────────┐
│ RENDER (Backend) │
│ FastAPI Python Server │
│ │
│ Endpoints: │
│ POST /analyze → URL Analysis │
│ POST /analyze-email → Email URL Extraction + Analysis │
│ POST /report → Threat Feed Submission │
│ GET /threat-feed → Community Feed │
│ GET /health → Health Check │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Processing Pipeline │ │
│ │ │ │
│ │ URL Input → Feature Extractor (21 features) │ │
│ │ → ML Model (Random Forest) │ │
│ │ → LLM (Groq - Llama 3.3 70B) │ │
│ │ → Response (Score + AI Explanation) │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
│ Storage: │
│ • phish_model.pkl (Trained ML Model) │
│ • threat_feed.json (Community Reports) │
└──────────────────────────┬──────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL SERVICES │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Groq API │ │ PhishTank │ │
│ │ (LLM Hosting) │ │ (Training Data)│ │
│ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘

## Data Flow

### URL Analysis Flow

1. User submits URL via Web App or Chrome Extension
2. Request sent to FastAPI `/analyze` endpoint
3. `feature_extractor.py` extracts 21 features from the URL
4. Trained Random Forest model (`phish_model.pkl`) predicts phishing probability
5. Feature flags are checked for suspicious patterns
6. Groq LLM generates plain-English explanation and safety recommendation
7. Response returned to user with risk score, verdict, explanation, and action

### Email Analysis Flow

1. User pastes email content into Email Analyzer
2. Request sent to `/analyze-email` endpoint
3. Regex extracts all URLs from the text
4. Each URL is individually analyzed through the same pipeline
5. Results aggregated and sorted by risk score
6. Summary returned with per-URL analysis

### Threat Feed Flow

1. User reports a URL via `/report` endpoint
2. Entry added to `threat_feed.json`
3. Community feed displayed via `/threat-feed` endpoint
4. Entries sorted by most recent first

## Feature Extraction (21 Features)

| #   | Feature             | Description                  |
| --- | ------------------- | ---------------------------- |
| 1   | URL Length          | Total character count        |
| 2   | Dot Count           | Number of dots               |
| 3   | Hyphen Count        | Hyphens in URL               |
| 4   | Underscore Count    | Underscores                  |
| 5   | Slash Count         | Path separators              |
| 6   | Question Count      | Query parameters             |
| 7   | Equal Count         | Parameter values             |
| 8   | @ Count             | Redirect indicators          |
| 9   | & Count             | Parameter separators         |
| 10  | % Count             | Encoded characters           |
| 11  | Digit Count         | Numeric characters           |
| 12  | Letter Count        | Alphabetic characters        |
| 13  | Uses HTTPS          | SSL/TLS presence             |
| 14  | Has IP Address      | IP-based URL detection       |
| 15  | Domain Length       | Domain character count       |
| 16  | Subdomain Count     | Number of subdomains         |
| 17  | Path Length         | Path character count         |
| 18  | Suspicious TLD      | Cheap/free TLD detection     |
| 19  | Digit/Letter Ratio  | Randomness indicator         |
| 20  | Suspicious Keywords | Phishing keyword count       |
| 21  | URL Entropy         | Shannon entropy (randomness) |

## Tech Stack

| Layer              | Technology                           |
| ------------------ | ------------------------------------ |
| Frontend           | React 18, Vite, TailwindCSS          |
| Backend            | Python 3.12, FastAPI                 |
| ML Model           | Scikit-learn, XGBoost, Random Forest |
| LLM                | Groq API — Llama 3.3 70B Versatile   |
| Extension          | Chrome Manifest V3                   |
| Hosting (Frontend) | Vercel                               |
| Hosting (Backend)  | Render                               |
| Version Control    | GitHub                               |
