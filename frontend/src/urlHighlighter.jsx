function UrlHighlighter({ url, flaggedFeatures }) {
  const highlightUrl = () => {
    if (!url) return null;

    let parts = [];
    let i = 0;

    while (i < url.length) {
      let highlighted = false;

      // Check for IP address pattern
      const ipMatch = url.slice(i).match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
      if (
        ipMatch &&
        flaggedFeatures.some((f) => f.toLowerCase().includes("ip"))
      ) {
        parts.push(
          <span
            key={i}
            className="bg-red-500/30 text-red-300 px-1 rounded"
            title="IP address used instead of domain"
          >
            {ipMatch[0]}
          </span>,
        );
        i += ipMatch[0].length;
        highlighted = true;
      }

      // Check for @ symbol
      if (
        !highlighted &&
        url[i] === "@" &&
        flaggedFeatures.some((f) => f.includes("@"))
      ) {
        parts.push(
          <span
            key={i}
            className="bg-red-500/40 text-red-200 px-0.5 rounded font-bold"
            title="@ symbol - possible redirect"
          >
            @
          </span>,
        );
        i += 1;
        highlighted = true;
      }

      // Check for digit substitution (typosquatting: 0 for o, 1 for l, etc.)
      if (!highlighted && /\d/.test(url[i])) {
        // Check if this digit is in a word position (surrounded by letters)
        const before = i > 0 ? url[i - 1] : "";
        const after = i < url.length - 1 ? url[i + 1] : "";
        const current = url[i];

        if (
          (/[a-zA-Z]/.test(before) || /[a-zA-Z]/.test(after)) &&
          flaggedFeatures.some(
            (f) =>
              f.toLowerCase().includes("digit") ||
              f.toLowerCase().includes("ratio"),
          )
        ) {
          parts.push(
            <span
              key={i}
              className="bg-yellow-500/40 text-yellow-200 px-0.5 rounded font-bold"
              title="Digit substitution - possible typosquatting"
            >
              {current}
            </span>,
          );
          i += 1;
          highlighted = true;
        }
      }

      // Check for suspicious TLD
      if (
        (!highlighted && url.slice(i).startsWith(".xyz")) ||
        url.slice(i).startsWith(".tk") ||
        url.slice(i).startsWith(".ml") ||
        url.slice(i).startsWith(".ga") ||
        url.slice(i).startsWith(".top") ||
        url.slice(i).startsWith(".club")
      ) {
        const tld = url.slice(i).split("/")[0].split("?")[0].split("#")[0];
        parts.push(
          <span
            key={i}
            className="bg-orange-500/40 text-orange-200 px-1 rounded"
            title="Suspicious top-level domain"
          >
            {tld}
          </span>,
        );
        i += tld.length;
        highlighted = true;
      }

      // Default: no highlight
      if (!highlighted) {
        parts.push(<span key={i}>{url[i]}</span>);
        i += 1;
      }
    }

    return parts;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🔍</span>
        <h3 className="font-semibold text-sm text-gray-300">URL Breakdown</h3>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm break-all leading-relaxed">
        {highlightUrl()}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500/30 rounded"></span> Dangerous
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500/40 rounded"></span> Suspicious
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-500/40 rounded"></span> Unusual TLD
        </span>
      </div>
    </div>
  );
}

export default UrlHighlighter;
