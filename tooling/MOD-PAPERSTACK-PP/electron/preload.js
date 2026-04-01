const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("paperstack", {
  selectFile: (filters) => ipcRenderer.invoke("select-file", filters),
  run: (args) => ipcRenderer.invoke("run-paperstack", args),
  stopAll: () => ipcRenderer.invoke("stop-all"),
  onLog: (callback) => ipcRenderer.on("paperstack-log", (_event, data) => callback(data)),
});
