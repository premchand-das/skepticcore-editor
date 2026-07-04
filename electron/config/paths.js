import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const electronDir = path.join(__dirname, "..");
export const rootDir = path.join(electronDir, "..");
export const projectsDir = path.join(rootDir, "projects");
export const ffmpegPath = path.join(rootDir, "tools", "ffmpeg", "ffmpeg.exe");