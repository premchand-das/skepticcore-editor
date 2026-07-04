import { ipcMain } from "electron";
import { AIDirector } from "../ai-director/index.js";

export function registerAIDirectorIPC() {
  ipcMain.handle("ai-director:analyze", async (_, payload) => {
    const director = new AIDirector();

    return director.analyze({
      transcript: payload.transcript,
      limit: payload.limit ?? 5,
    });
  });
}