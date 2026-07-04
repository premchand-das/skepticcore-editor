import path from "node:path";
import crypto from "node:crypto";
import { safeProjectName } from "../fs/safePath.js";
import { ensureDir } from "../fs/fileSystem.js";
import { createProjectSchema } from "./project.schema.js";
import { ProjectPaths } from "./ProjectPaths.js";
import { ProjectStore } from "./ProjectStore.js";

export class ProjectManager {
  constructor({ projectsDir }) {
    this.projectsDir = projectsDir;
    this.activeProjectId = null;
    this.activeProjectPath = null;
  }

  async createProject() {
    await ensureDir(this.projectsDir);

    const id = crypto.randomUUID();
    const name = safeProjectName();
    const projectPath = path.join(this.projectsDir, name);

    const paths = new ProjectPaths(projectPath);
    await paths.ensureAll();

    const store = new ProjectStore(paths.metadata());

    const project = createProjectSchema({
      id,
      name,
      projectPath,
    });

    await store.write(project);

    this.activeProjectId = id;
    this.activeProjectPath = projectPath;

    return { project, paths, store };
  }

  async loadProject(projectPath) {
    const paths = new ProjectPaths(projectPath);
    const store = new ProjectStore(paths.metadata());
    const project = await store.read();

    if (!project) {
      throw new Error("Invalid project. Missing project.json.");
    }

    this.activeProjectId = project.id;
    this.activeProjectPath = projectPath;

    return { project, paths, store };
  }

  async getActiveProject() {
    if (!this.activeProjectPath) return null;
    return this.loadProject(this.activeProjectPath);
  }

  async updateActiveProject(mutator) {
    const active = await this.getActiveProject();

    if (!active) {
      throw new Error("No active project.");
    }

    const updated = await active.store.update(mutator);

    return {
      ...active,
      project: updated,
    };
  }
}