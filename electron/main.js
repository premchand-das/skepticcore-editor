import { app, BrowserWindow, protocol } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerProjectsIpc } from "./ipc/projects.js";
import { registerAIDirectorIPC } from "./ipc/aiDirector.ipc.js";

app.whenReady().then(() => {
  createWindow();

  registerProjectIPC();
  registerDownloaderIPC();
  registerTranscriptIPC();
  registerRendererIPC();

  registerAIDirectorIPC();
});

import { registerPreviewProtocol } from "./services/preview.js";
import { registerDownloadIpc } from "./ipc/download.js";
import { registerClipsIpc } from "./ipc/clips.js";

import { registerAiIpc } from "./ipc/ai.js";
import { registerTemplatesIpc } from "./ipc/templates.js";
import { registerMusicIpc } from "./ipc/music.js";


protocol.registerSchemesAsPrivileged([
  {
    scheme: "skepticcore-video",
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    backgroundColor: "#050505",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  registerPreviewProtocol();
  registerDownloadIpc();
  registerClipsIpc();
  registerProjectsIpc();
  registerAiIpc();
  registerTemplatesIpc();
registerMusicIpc();

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});