# PhishTrace AI — Presentation Outline

## Slide 1: Title

- 🛡️ PhishTrace AI
- AI-Powered Phishing Detection with Explainable Intelligence
- Hackverse X 2026 — Cybersecurity & Privacy Track
- Team: [Your Name(s)]

## Slide 2: The Problem

- Phishing = #1 cyber attack vector
- 3.4 billion phishing emails sent daily
- Existing tools give binary verdicts (safe/dangerous)
- Users don't learn WHY something is phishing
- Security analysts waste time on manual investigation

## Slide 3: Our Solution

- Real-time URL analysis with risk scoring
- AI-generated plain-English explanations
- Visual highlighting of suspicious URL patterns
- Chrome extension for instant protection
- Email analyzer for phishing email detection
- Community threat intelligence feed

## Slide 4: Architecture

- [Insert architecture diagram from docs/architecture.md]
- Frontend: React + Vite + TailwindCSS
- Backend: Python FastAPI
- ML: Random Forest Classifier (21 features)
- AI: Groq LLM (Llama 3.3 70B)
- Extension: Chrome Manifest V3

## Slide 5: How It Works

1. User submits URL (web app / extension / email paste)
2. Feature extractor analyzes 21 URL characteristics
3. ML model predicts phishing probability
4. LLM generates human-readable explanation
5. Visual highlighter shows suspicious patterns
6. Optional: report to community threat feed

## Slide 6: Demo Screenshots

- Web app showing a phishing detection
- AI explanation close-up
- URL visual highlighting
- Chrome extension popup
- Email analyzer results
- Threat feed page

## Slide 7: Key Features

- 🧠 AI-Powered Explanations (not just yes/no)
- 🔍 Visual URL Breakdown (see what's suspicious)
- 🧩 Chrome Extension (one-click scanning)
- 📧 Email Analyzer (bulk URL extraction)
- 🌐 Community Threat Feed (crowd-sourced defense)
- 🔒 Privacy-First (no URL logging)

## Slide 8: Tech Stack

- Frontend: React 18, Vite, TailwindCSS
- Backend: Python 3.12, FastAPI
- ML: Scikit-learn, XGBoost
- AI: Groq API (Llama 3.3 70B Versatile)
- Extension: Chrome Manifest V3
- Hosting: Render + Vercel

## Slide 9: Impact

- Makes phishing detection understandable for everyone
- Reduces successful phishing attacks through education
- Helps security analysts triage faster
- Community feed enables collective defense
- Open source — anyone can deploy and improve

## Slide 10: Thank You

- GitHub: [Your Repo URL]
- Live Demo: [Vercel URL]
- Questions?
