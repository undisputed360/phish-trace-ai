import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeUrl = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze", {
        url,
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: "Failed to connect. Is the backend running?" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2">🛡️ PhishTrace AI</h1>
      <p className="text-gray-400 mb-8">
        Detect phishing URLs with AI-powered explanations
      </p>

      <div className="flex gap-3 w-full max-w-xl">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to analyze..."
          className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={analyzeUrl}
          disabled={loading || !url}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-semibold transition"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg max-w-xl w-full">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
