import path from "node:path";
import { ensureDir } from "../fs/fileSystem.js";

export class ProjectPaths {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  metadata() {
    return path.join(this.projectPath, "project.json");
  }

  video() {
    return path.join(this.projectPath, "video.mp4");
  }

  audio() {
    return path.join(this.projectPath, "audio.wav");
  }

  captionsDir() {
    return path.join(this.projectPath, "captions");
  }

  clipsDir() {
    return path.join(this.projectPath, "clips");
  }

  tempDir() {
    return path.join(this.projectPath, "temp");
  }

  async ensureAll() {
    await ensureDir(this.projectPath);
    await ensureDir(this.captionsDir());
    await ensureDir(this.clipsDir());
    await ensureDir(this.tempDir());
  }
}