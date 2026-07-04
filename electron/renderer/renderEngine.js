import { spawn } from "node:child_process";
import { ffmpegPath } from "../config/paths.js";
import { buildRenderPipeline } from "./engine/RenderPipeline.js";

export async function buildRenderArgs(payload) {
  return buildRenderPipeline(payload);
}

export function runRender(args) {
  return new Promise((resolve) => {
    console.log("[ffmpeg] command:", ffmpegPath, args.join(" "));

    const ffmpeg = spawn(ffmpegPath, args, {
      shell: false,
      windowsHide: true,
    });

    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      console.log("[ffmpeg]", text);
    });

    ffmpeg.on("error", (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });

    ffmpeg.on("close", (code) => {
      resolve({
        success: code === 0,
        code,
        error: stderr,
      });
    });
  });
}