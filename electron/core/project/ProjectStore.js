import { readJson, writeJson } from "../fs/fileSystem.js";

export class ProjectStore {
  constructor(metadataPath) {
    this.metadataPath = metadataPath;
  }

  async read() {
    return readJson(this.metadataPath, null);
  }

  async write(project) {
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    await writeJson(this.metadataPath, updated);
    return updated;
  }

  async update(mutator) {
    const current = await this.read();

    if (!current) {
      throw new Error("Project metadata not found.");
    }

    const next = await mutator(current);
    return this.write(next);
  }
}