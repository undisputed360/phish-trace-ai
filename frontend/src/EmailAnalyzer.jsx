import { useState } from "react";
import axios from "axios";

const API_URL = "https://phishtrace-ai-api.onrender.com";
// const API_URL = 'http://localhost:8000';

function EmailAnalyzer() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeEmail = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_URL}/analyze-email`, {
        headers_text: emailText,
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: "Failed to analyze email. Is the backend running?" });
    }
    setLoading(false);
  };

  const loadSample = () => {
    setEmailText(`From: "Netflix Support" <support@netfl1x-support.com>
Subject: Your account has been suspended

Dear user,

Your Netflix account has been suspended due to a billing issue.
Please verify your payment method at:
http://netfl1x.com/account/verify?token=12345

Or update your billing info here:
https://www.netflix.com/account

Thank you,
Netflix Support Team`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <h1 className="text-2xl font-bold">Email Analyzer</h1>
          </div>
          <div className="flex gap-4">
            <a href="/" className="text-sm text-blue-400 hover:text-blue-300">
              Scanner
            </a>
            <a
              href="/feed"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Threat Feed
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Input Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Paste Email Headers & Body
            </h2>
            <button
              onClick={loadSample}
              className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg px-3 py-1"
            >
              Load Sample
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Paste the full email including headers and body. We'll extract and
            analyze every URL for phishing.
          </p>

          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste email content here..."
            rows={10}
            className="w-full p-4 rounded-lg bg-gray-900 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition font-mono text-sm resize-y"
          />

          <button
            onClick={analyzeEmail}
            disabled={loading || !emailText.trim()}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing Email...
              </span>
            ) : (
              "🔍 Analyze Email"
            )}
          </button>
        </div>

        {/* Results */}
        {result && !result.error && (
          <div className="space-y-4">
            {/* Summary */}
            <div
              className={`rounded-xl p-6 border-2 ${
                result.suspicious_count > 0
                  ? "bg-red-900/20 border-red-500/50"
                  : "bg-green-900/20 border-green-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">URLs Found</span>
                  <div className="text-3xl font-bold mt-1">
                    {result.urls_found}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold px-4 py-2 rounded-full ${
                    result.suspicious_count > 0
                      ? "bg-red-600/30 text-red-300"
                      : "bg-green-600/30 text-green-300"
                  }`}
                >
                  {result.suspicious_count > 0
                    ? `⚠️ ${result.suspicious_count} Suspicious`
                    : "✅ All Safe"}
                </div>
              </div>
              <p className="text-gray-300 mt-3">{result.summary}</p>
            </div>

            {/* Individual URLs */}
            {result.analyzed_urls && result.analyzed_urls.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300">Analyzed URLs:</h3>
                {result.analyzed_urls.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-4 border flex items-center justify-between ${
                      item.is_suspicious
                        ? "bg-red-900/10 border-red-500/30"
                        : "bg-green-900/10 border-green-500/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-mono text-sm text-gray-300 truncate">
                        {item.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-lg font-bold ${
                          item.is_suspicious ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {item.risk_score}%
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          item.is_suspicious
                            ? "bg-red-600/30 text-red-300"
                            : "bg-green-600/30 text-green-300"
                        }`}
                      >
                        {item.is_suspicious ? "⚠️ Phish" : "✅ Safe"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {result && result.error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300">❌ {result.error}</p>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <span className="text-5xl mb-4 block">📧</span>
            <h3 className="text-lg font-semibold mb-2">
              Email Phishing Analyzer
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Paste a suspicious email above. We'll extract every URL and
              analyze them for phishing threats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailAnalyzer;
