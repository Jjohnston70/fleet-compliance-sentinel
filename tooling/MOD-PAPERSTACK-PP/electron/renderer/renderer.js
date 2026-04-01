const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

function appendLog(text) {
  logEl.textContent += text;
  logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text;
}

window.paperstack.onLog((data) => appendLog(data));

// Stop servers
document.getElementById("stop-all").onclick = async () => {
  await window.paperstack.stopAll();
  appendLog("\nStopped running servers.\n");
  setStatus("Stopped");
};

// Quick actions
document.querySelectorAll(".actions button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const action = btn.dataset.action;
    logEl.textContent = "";
    let args = [];
    if (action === "generate-pdf") args = ["generate", "pdf"];
    if (action === "generate-docx") args = ["generate", "docx"];
    if (action === "check") args = ["check"];
    await runPaperstack(args);
  });
});

// Convert MD
document.getElementById("pick-md").onclick = async () => {
  const file = await window.paperstack.selectFile([{ name: "Markdown", extensions: ["md"] }]);
  if (file) document.getElementById("md-file").value = file;
};
document.getElementById("run-md").onclick = async () => {
  const file = document.getElementById("md-file").value.trim();
  if (!file) return setStatus("Select a Markdown file first");
  const args = ["convert", file];
  if (document.getElementById("md-dark").checked) args.push("--dark");
  if (document.getElementById("md-open").checked) args.push("--open");
  logEl.textContent = "";
  await runPaperstack(args);
};

// Reverse DOCX
document.getElementById("pick-rev").onclick = async () => {
  const file = await window.paperstack.selectFile([{ name: "Word", extensions: ["docx"] }]);
  if (file) document.getElementById("rev-file").value = file;
};
document.getElementById("run-rev").onclick = async () => {
  const file = document.getElementById("rev-file").value.trim();
  if (!file) return setStatus("Select a DOCX file first");
  const mode = document.querySelector("input[name='rev-mode']:checked").value;
  const args = ["reverse", file];
  if (mode === "python") args.push("--python");
  if (mode === "pdf") args.push("--pdf");
  logEl.textContent = "";
  await runPaperstack(args);
};

// Inspect
document.getElementById("pick-inspect").onclick = async () => {
  const file = await window.paperstack.selectFile([{ name: "PDF", extensions: ["pdf"] }]);
  if (file) document.getElementById("inspect-file").value = file;
};
document.getElementById("run-inspect").onclick = async () => {
  const file = document.getElementById("inspect-file").value.trim();
  const port = document.getElementById("inspect-port").value.trim() || "5001";
  if (!file) return setStatus("Select a PDF first");
  await window.paperstack.stopAll();
  const args = ["inspect", file, "--port", port];
  logEl.textContent = "";
  await runPaperstack(args);
};

// Scan OCR
document.getElementById("pick-scan").onclick = async () => {
  const file = await window.paperstack.selectFile([{ name: "PDF", extensions: ["pdf"] }]);
  if (file) document.getElementById("scan-file").value = file;
};
document.getElementById("run-scan").onclick = async () => {
  const file = document.getElementById("scan-file").value.trim();
  const port = document.getElementById("scan-port").value.trim() || "5002";
  const dpi = document.getElementById("scan-dpi").value.trim() || "300";
  const force = document.getElementById("scan-force").checked;
  if (!file) return setStatus("Select a PDF first");
  await window.paperstack.stopAll();
  const args = ["scan", file, "--port", port, "--dpi", dpi];
  if (force) args.push("--force-ocr");
  logEl.textContent = "";
  await runPaperstack(args);
};

async function runPaperstack(args) {
  setStatus("Running...");
  appendLog(`> python paperstack.py ${args.join(" ")}\n\n`);
  const result = await window.paperstack.run(args);
  if (result.stderr) appendLog(result.stderr);
  if (result.stdout) appendLog(result.stdout);
  if (result.background) {
    appendLog(`\nServer running (pid ${result.pid}). Use Stop Servers when done.\n`);
    setStatus(`Running server (pid ${result.pid})`);
  } else {
    setStatus(`Done (exit ${result.code})`);
  }
}
