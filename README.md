# phish-trace-ai

AI-powered phishing URL detection with explainable threat analysis

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Chrome Browser
- Groq API Key (free — [get one here](https://console.groq.com))

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows Git Bash
# OR: venv\Scripts\activate   # Windows CMD

pip install -r requirements.txt
python train_model.py          # Train the ML model

# Add your Groq API key
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

uvicorn main:app --reload --port 8000
```
