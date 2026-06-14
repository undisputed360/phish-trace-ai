// Get current tab URL on popup open
let currentUrl = "";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url) {
    currentUrl = tabs[0].url;
    document.getElementById("currentUrl").textContent = currentUrl;
  } else {
    document.getElementById("currentUrl").textContent =
      "Cannot access this page";
    document.getElementById("scanBtn").disabled = true;
  }
});

document.getElementById("scanBtn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("errorBox");
  const scanBtn = document.getElementById("scanBtn");

  // Reset
  resultDiv.style.display = "none";
  errorDiv.style.display = "none";

  // Show loading
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';

  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Display result
    resultDiv.style.display = "block";

    if (data.is_suspicious) {
      resultDiv.className = "danger";
      resultDiv.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>SUSPICIOUS</b>
          <span class="score score-danger">${data.risk_score}%</span>
        </div>
        <div class="explanation">${data.explanation}</div>
        ${data.action ? `<div class="action">💡 ${data.action}</div>` : ""}
      `;
    } else {
      resultDiv.className = "safe";
      resultDiv.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>SAFE</b>
          <span class="score score-safe">${data.risk_score}%</span>
        </div>
        <div class="explanation">${data.explanation}</div>
        ${data.action ? `<div class="action">💡 ${data.action}</div>` : ""}
      `;
    }
  } catch (error) {
    errorDiv.style.display = "block";
    errorDiv.textContent =
      "⚠️ Cannot connect to PhishTrace AI. Make sure the backend server is running on port 8000.";
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = "🔍 Scan This Page";
  }
});
