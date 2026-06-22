const API_URL = "http://localhost:8000";

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

  resultDiv.style.display = "none";
  errorDiv.style.display = "none";
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';

  try {
    const response = await fetch(API_URL + "/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

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
      "Cannot connect. Make sure the backend is running on localhost:8000";
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = "Scan This Page";
  }
});
