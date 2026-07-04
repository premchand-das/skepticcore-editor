import { ipcMain } from "electron";
import { generateClips } from "../services/ffmpeg.js";

export function registerClipsIpc() {
  ipcMain.handle("generate-clips", async (event, payload) => {
    const clips = Array.isArray(payload) ? payload : payload?.clips;
    const options = Array.isArray(payload) ? {} : payload?.options || {};

    return generateClips(event, clips, options);
  });
}