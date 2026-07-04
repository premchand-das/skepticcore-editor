import path from "node:path";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { ffmpegPath } from "../config/paths.js";
import { exists } from "../core/fs/fileSystem.js";
import { updateActiveProject } from "./projects.js";

function sendProgress(event, payload) {
  event?.sender?.send("download-progress", payload);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...options,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      console.log(text);
    });

    child.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      console.log(text);
    });

    child.on("error", (error) => {
      resolve({
        code: -1,
        stdout,
        stderr: error.message,
      });
    });

    child.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr,
      });
    });
  });
}

export async function transcribeWithWhisper(event, projectPath, videoPath) {
  const audioPath = path.join(projectPath, "audio.wav");
  const generatedPath = path.join(projectPath, "audio.json");

  if (await exists(generatedPath)) {
    return {
      success: true,
      message: "Whisper transcript already exists.",
      transcriptPath: generatedPath,
    };
  }

  sendProgress(event, {
    type: "status",
    message: "Extracting audio for Whisper...",
  });

  const extractAudio = await runCommand(ffmpegPath, [
    "-y",
    "-i",
    videoPath,
    "-vn",
    "-acodec",
    "pcm_s16le",
    "-ar",
    "16000",
    "-ac",
    "1",
    audioPath,
  ]);

  if (extractAudio.code !== 0) {
    return {
      success: false,
      message: "Failed to extract audio for Whisper.",
      error: extractAudio.stderr,
    };
  }

  sendProgress(event, {
    type: "status",
    message: "Whisper is transcribing audio...",
  });

  const whisper = await runCommand("python", [
    "-m",
    "whisper",
    audioPath,
    "--model",
    "base",
    "--language",
    "en",
    "--output_format",
    "json",
    "--output_dir",
    projectPath,
    "--fp16",
    "False",
  ]);

  if (whisper.code !== 0) {
    return {
      success: false,
      message:
        "Whisper transcription failed. Make sure openai-whisper is installed with pip.",
      error: whisper.stderr,
    };
  }

  if (!(await exists(generatedPath))) {
    return {
      success: false,
      message: "Whisper finished but transcript JSON was not found.",
    };
  }

  const segments = await readWhisperSegments(generatedPath);

  await updateActiveProject((project) => ({
    ...project,
    media: {
      ...project.media,
      audioPath,
    },
    transcript: {
      source: "whisper",
      path: generatedPath,
      segments: segments.length,
      available: segments.length > 0,
    },
  }));

  return {
    success: true,
    message: "Whisper transcript generated.",
    transcriptPath: generatedPath,
  };
}

export async function readWhisperSegments(transcriptPath) {
  const raw = await readFile(transcriptPath, "utf8");
  const json = JSON.parse(raw);

  return (json.segments || [])
    .map((segment) => ({
      start: Number(segment.start || 0),
      end: Number(segment.end || 0),
      text: String(segment.text || "").replace(/\s+/g, " ").trim(),
    }))
    .filter((segment) => segment.text && segment.end > segment.start);
}