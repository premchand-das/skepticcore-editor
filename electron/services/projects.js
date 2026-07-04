import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import { projectsDir } from "../config/paths.js";
import { ProjectManager } from "../core/project/ProjectManager.js";

export const projectManager = new ProjectManager({
  projectsDir,
});

export async function createProject() {
  const result = await projectManager.createProject();

  return {
    projectName: result.project.name,
    projectPath: result.project.projectPath,
    project: result.project,
    paths: result.paths,
    store: result.store,
  };
}

export async function getActiveProject() {
  return projectManager.getActiveProject();
}

export async function updateActiveProject(mutator) {
  return projectManager.updateActiveProject(mutator);
}

export async function findDownloadedMp4(projectPath) {
  const files = await readdir(projectPath);

  const mp4File = files.find((file) => /^video\.mp4$/i.test(file));
  if (!mp4File) return null;

  const fullPath = path.join(projectPath, mp4File);
  const info = await stat(fullPath);

  return info.isFile() ? fullPath : null;
}

export async function ensureClipsDir(projectPath) {
  const active = await projectManager.loadProject(projectPath);
  await active.paths.ensureAll();
  return active.paths.clipsDir();
}