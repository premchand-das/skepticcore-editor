const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  downloadVideo: (url) => ipcRenderer.invoke("download-video", url),

  generateClips: (payload) => ipcRenderer.invoke("generate-clips", payload),

  generateAiClips: (settings) =>
    ipcRenderer.invoke("ai-generate-clips", settings),

  aiDirectorAnalyze: (payload) =>
    ipcRenderer.invoke("ai-director:analyze", payload),

  listTemplates: () => ipcRenderer.invoke("templates:list"),

  listMusicTracks: () => ipcRenderer.invoke("music:list"),

  getActiveProject: () => ipcRenderer.invoke("project:active"),

  onDownloadProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("download-progress", listener);

    return () => {
      ipcRenderer.removeListener("download-progress", listener);
    };
  },
});