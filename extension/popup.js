document.getElementById("scanBtn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.textContent = "Analyzing...";
  resultDiv.className = "";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = tab.url;

    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (data.is_suspicious) {
      resultDiv.className = "danger";
      resultDiv.innerHTML = `
        <b>Suspicious URL Detected</b><br/>
        Risk Score: <b>${data.risk_score}%</b><br/><br/>
        ${data.explanation}
      `;
    } else {
      resultDiv.className = "safe";
      resultDiv.innerHTML = `
        <b>URL Looks Safe</b><br/>
        Risk Score: <b>${data.risk_score}%</b>
      `;
    }
  } catch (error) {
    resultDiv.textContent =
      "Error connecting to PhishTrace API. Make sure the server is running.";
    resultDiv.className = "danger";
  }
});
