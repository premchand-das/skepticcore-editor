import { ipcMain } from "electron";
import { downloadYoutubeVideo } from "../services/downloader.js";

export function registerDownloadIpc() {
  ipcMain.handle("download-video", async (event, url) => {
    if (!url || typeof url !== "string") {
      return {
        success: false,
        message: "Please provide a valid YouTube URL.",
      };
    }

    return downloadYoutubeVideo(event, url);
  });
}