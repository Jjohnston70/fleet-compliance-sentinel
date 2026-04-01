// Main process for the PaperStack Electron shell
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const APP_ROOT = path.join(__dirname, "..");
const isWindows = process.platform === "win32";
const running = new Map(); // pid -> child

function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 700,
    minWidth: 840,
    minHeight: 640,
    backgroundColor: "#0f2236",
    title: "PaperStack",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: open file picker
ipcMain.handle("select-file", async (event, filters = []) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters,
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// IPC: run paperstack command
ipcMain.handle("run-paperstack", async (event, args) => {
  const longRunning = args[0] === "inspect" || args[0] === "scan";
  return new Promise((resolve) => {
    const py = isWindows ? "python" : "python3";
    const child = spawn(py, [path.join(APP_ROOT, "paperstack.py"), ...args], {
      cwd: APP_ROOT,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      event.sender.send("paperstack-log", data.toString());
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      event.sender.send("paperstack-log", data.toString());
    });

    child.on("close", (code) => {
      running.delete(child.pid);
      event.sender.send("paperstack-log", `\nProcess ${child.pid} exited with code ${code}\n`);
      if (!longRunning) resolve({ code, stdout, stderr, pid: child.pid, background: false });
    });

    if (longRunning) {
      running.set(child.pid, child);
      resolve({ code: null, stdout, stderr, pid: child.pid, background: true });
    }
  });
});

// IPC: stop all running long-lived processes
ipcMain.handle("stop-all", async () => {
  for (const [pid, proc] of running) {
    try {
      proc.kill();
    } catch (e) {
      /* ignore */
    }
  }
  running.clear();
  return true;
});
