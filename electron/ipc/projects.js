import { ipcMain } from "electron";
import { getActiveProject } from "../services/projects.js";

export function registerProjectsIpc() {
  ipcMain.handle("project:active", async () => {
    const active = await getActiveProject();

    if (!active) {
      return {
        success: false,
        message: "No active project.",
        project: null,
      };
    }

    return {
      success: true,
      project: active.project,
    };
  });
}