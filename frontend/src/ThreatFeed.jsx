import { useState, useEffect } from "react";
import axios from "axios";

function ThreatFeed() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await axios.get("http://localhost:8000/threat-feed");
      setFeed(response.data);
    } catch (error) {
      setFeed({ error: "Failed to load threat feed" });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading threat feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <h1 className="text-2xl font-bold">Community Threat Feed</h1>
          </div>
          <a href="/" className="text-sm text-blue-400 hover:text-blue-300">
            ← Back to Scanner
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {feed && !feed.error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {feed.total}
                </div>
                <div className="text-sm text-gray-400 mt-1">Total Reports</div>
              </div>
              <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30 text-center">
                <div className="text-3xl font-bold text-red-400">
                  {feed.suspicious_count}
                </div>
                <div className="text-sm text-gray-400 mt-1">Suspicious</div>
              </div>
              <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {feed.total - feed.suspicious_count}
                </div>
                <div className="text-sm text-gray-400 mt-1">Safe</div>
              </div>
            </div>

            {/* Feed Entries */}
            {feed.entries && feed.entries.length > 0 ? (
              <div className="space-y-3">
                {feed.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-xl p-4 border ${
                      entry.is_suspicious
                        ? "bg-red-900/10 border-red-500/30"
                        : "bg-green-900/10 border-green-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-gray-300 truncate">
                          {entry.url}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported{" "}
                          {new Date(entry.reported_at).toLocaleString()}
                          {entry.reported_by !== "anonymous" &&
                            ` by ${entry.reported_by}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            entry.is_suspicious
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {entry.risk_score}%
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            entry.is_suspicious
                              ? "bg-red-600/30 text-red-300"
                              : "bg-green-600/30 text-green-300"
                          }`}
                        >
                          {entry.is_suspicious ? "⚠️" : "✅"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                <span className="text-4xl mb-4 block">📭</span>
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-gray-400 text-sm">
                  Be the first to report a suspicious URL from the scanner page
                </p>
              </div>
            )}
          </>
        )}

        {feed && feed.error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300">❌ {feed.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreatFeed;
