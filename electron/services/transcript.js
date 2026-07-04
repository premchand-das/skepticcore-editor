import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { updateActiveProject } from "./projects.js";

export async function findTranscript(projectPath) {
  const files = await readdir(projectPath);

  const transcriptFile = files.find((file) =>
    /\.(vtt|srt|json3)$/i.test(file)
  );

  if (!transcriptFile) return null;

  return path.join(projectPath, transcriptFile);
}

export function timeToSeconds(time) {
  const clean = String(time).replace(",", ".");
  const parts = clean.split(":").map(Number);

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];

  return Number(parts[0] || 0);
}

export function secondsToTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export function parseVtt(content) {
  const lines = content.split(/\r?\n/);
  const segments = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.includes("-->")) continue;

    const [startRaw, endRaw] = line.split("-->").map((v) => v.trim());
    const start = startRaw.split(" ")[0];
    const end = endRaw.split(" ")[0];

    let text = "";
    let j = i + 1;

    while (j < lines.length && lines[j]?.trim()) {
      text += ` ${lines[j].replace(/<[^>]+>/g, "").trim()}`;
      j++;
    }

    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText) {
      segments.push({
        start: timeToSeconds(start),
        end: timeToSeconds(end),
        text: cleanText,
      });
    }
  }

  return segments;
}

export function parseSrt(content) {
  return parseVtt(content);
}

export function parseJson3(content) {
  const json = JSON.parse(content);
  const events = json.events || [];

  return events
    .filter((event) => event.segs && event.tStartMs !== undefined)
    .map((event) => {
      const text = event.segs
        .map((seg) => seg.utf8 || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();

      return {
        start: event.tStartMs / 1000,
        end: (event.tStartMs + (event.dDurationMs || 3000)) / 1000,
        text,
      };
    })
    .filter((segment) => segment.text);
}

export async function readTranscriptSegments(projectPath) {
  const transcriptPath = await findTranscript(projectPath);

  if (!transcriptPath) {
    return {
      success: false,
      message: "No transcript found. Try another video with captions.",
      segments: [],
    };
  }

  const content = await readFile(transcriptPath, "utf8");
  const ext = path.extname(transcriptPath).toLowerCase();

  let segments = [];

  if (ext === ".vtt") segments = parseVtt(content);
  if (ext === ".srt") segments = parseSrt(content);
  if (ext === ".json3") segments = parseJson3(content);

  if (!segments.length) {
    return {
      success: false,
      message: "Transcript found, but no usable text was parsed.",
      segments: [],
    };
  }

  await updateActiveProject((project) => ({
    ...project,
    transcript: {
      source: "youtube",
      path: transcriptPath,
      segments: segments.length,
      available: true,
    },
  }));

  return {
    success: true,
    message: `Parsed ${segments.length} transcript segments.`,
    transcriptPath,
    segments,
  };
}