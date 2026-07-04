import { ipcMain } from "electron";
import { listMusicTracks } from "../renderer/music/library.js";

export function registerMusicIpc() {
  ipcMain.handle("music:list", async () => {
    return {
      success: true,
      tracks: listMusicTracks(),
    };
  });
}