import EmailAnalyzer from "./EmailAnalyzer";
import { useState } from "react";
import axios from "axios";
import ThreatFeed from "./ThreatFeed";
const API_URL = "https://phishtrace-ai-api.onrender.com";
// For local dev, comment the above and uncomment below:
// const API_URL = '${API_URL}';

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("scanner");

  if (page === "feed") return <ThreatFeed />;
  if (page === "feed") return <ThreatFeed />;
  if (page === "email") return <EmailAnalyzer />;

  const analyzeUrl = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post("${API_URL}/analyze", {
        url,
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: "Failed to connect. Is the backend running?" });
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url) {
      analyzeUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-bold">PhishTrace AI</h1>
            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
          <button
            onClick={() => setPage("feed")}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            🌐 Threat Feed
          </button>
          <button
            onClick={() => setPage("email")}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            📧 Email Analyzer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Input Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Analyze a URL</h2>
          <p className="text-gray-400 text-sm mb-4">
            Paste any URL to check if it's a phishing attempt. Our AI will
            explain exactly what makes it safe or dangerous.
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a URL here... (e.g., http://faceb00k.com/login)"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={analyzeUrl}
              disabled={loading || !url}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
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
                  Analyzing...
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && !result.error && (
          <div className="space-y-6">
            {/* Risk Score Card */}
            <div
              className={`rounded-xl p-6 border-2 ${
                result.is_suspicious
                  ? "bg-red-900/20 border-red-500/50"
                  : "bg-green-900/20 border-green-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-400">Risk Score</span>
                  <div className="text-4xl font-bold mt-1">
                    {result.risk_score}%
                  </div>
                </div>
                <div
                  className={`text-lg font-bold px-4 py-2 rounded-full ${
                    result.is_suspicious
                      ? "bg-red-600/30 text-red-300"
                      : "bg-green-600/30 text-green-300"
                  }`}
                >
                  {result.is_suspicious ? "⚠️ SUSPICIOUS" : "✅ SAFE"}
                </div>
              </div>

              {/* Risk Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.risk_score > 70
                      ? "bg-red-500"
                      : result.risk_score > 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>

              {/* AI Explanation */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    AI Analysis {result.ai_generated && "(Powered by Groq)"}
                  </span>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Action */}
              <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-300 font-semibold">
                  💡 Recommendation:
                </p>
                <p className="text-gray-300 mt-1">{result.action}</p>
              </div>
            </div>

            {/* Flagged Features */}
            {result.flagged_features && result.flagged_features.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-semibold mb-3">🚩 Suspicious Indicators</h3>
                <ul className="space-y-2">
                  {result.flagged_features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="text-red-400 mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Report Button */}
            <button
              onClick={async () => {
                try {
                  await axios.post("${API_URL}/report", {
                    url: result.url,
                    risk_score: result.risk_score,
                    is_suspicious: result.is_suspicious,
                    reported_by: "web-user",
                  });
                  alert("✅ URL reported to threat feed!");
                } catch (e) {
                  alert("Failed to report. Is the backend running?");
                }
              }}
              className="w-full bg-yellow-600/20 border border-yellow-500/40 hover:bg-yellow-600/30 rounded-xl p-3 text-yellow-300 text-sm font-semibold transition text-center"
            >
              🚨 Report This URL to Community Threat Feed
            </button>

            {/* Raw URL */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Analyzed URL</p>
              <p className="text-sm text-gray-400 break-all font-mono">
                {result.url}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {result && result.error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300">❌ {result.error}</p>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold mb-2">Ready to analyze</h3>
            <p className="text-gray-400 text-sm">
              Paste a URL above to check if it's a phishing attempt
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
