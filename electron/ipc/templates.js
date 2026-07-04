import { ipcMain } from "electron";
import { listTemplates } from "../renderer/templates/index.js";

export function registerTemplatesIpc() {
  ipcMain.handle("templates:list", async () => {
    return {
      success: true,
      templates: listTemplates(),
    };
  });
}