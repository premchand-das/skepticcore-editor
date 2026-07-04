import path from "node:path";
import { writeFile } from "node:fs/promises";
import { readTranscriptSegments } from "../../services/transcript.js";
import {
  transcribeWithWhisper,
  readWhisperSegments,
} from "../../services/whisper.js";
import {
  getActiveProject,
  updateActiveProject,
} from "../../services/projects.js";

function toAssTime(seconds) {
  const totalCs = Math.max(0, Math.floor(seconds * 100));
  const h = Math.floor(totalCs / 360000);
  const m = Math.floor((totalCs % 360000) / 6000);
  const s = Math.floor((totalCs % 6000) / 100);
  const cs = totalCs % 100;

  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
    2,
    "0",
  )}.${String(cs).padStart(2, "0")}`;
}

function timeToSeconds(time) {
  const parts = String(time).split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(parts[0] || 0);
}

function cleanText(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCaptionText(text) {
  return cleanText(text)
    .replace(/\buh\b/gi, "")
    .replace(/\bum\b/gi, "")
    .replace(/\byou know\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAssText(text) {
  return normalizeCaptionText(text)
    .replace(/[{}]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, " ");
}

function chunkWords(text) {
  const words = normalizeCaptionText(text).split(" ").filter(Boolean);
  const chunks = [];

  for (let i = 0; i < words.length; i += 4) {
    const chunk = words
      .slice(i, i + 4)
      .join(" ")
      .trim();
    if (!chunk) continue;

    const previous = chunks[chunks.length - 1];
    if (previous && previous.toLowerCase() === chunk.toLowerCase()) continue;

    chunks.push(chunk);
  }

  return chunks;
}

async function getTranscriptSegments(event) {
  const active = await getActiveProject();

  if (!active?.project?.media?.videoPath) return [];

  const { project } = active;
  const transcript = await readTranscriptSegments(project.projectPath);

  if (transcript.success) return transcript.segments;

  const whisper = await transcribeWithWhisper(
    event,
    project.projectPath,
    project.media.videoPath,
  );

  if (!whisper.success) return [];

  await updateActiveProject((current) => ({
    ...current,
    transcript: {
      source: "whisper",
      path: whisper.transcriptPath,
      segments: 0,
      available: true,
    },
  }));

  return readWhisperSegments(whisper.transcriptPath);
}

export async function createClipSrt(event, clip, outputDir) {
  const clipStart = timeToSeconds(clip.start);
  const clipEnd = timeToSeconds(clip.end);

  const allSegments = await getTranscriptSegments(event);

  const clipSegments = allSegments
    .filter((segment) => segment.end >= clipStart && segment.start <= clipEnd)
    .map((segment) => ({
      start: Math.max(0, segment.start - clipStart),
      end: Math.min(
        clipEnd - clipStart,
        Math.max(0.4, segment.end - clipStart),
      ),
      text: cleanText(segment.text),
    }))
    .filter((segment) => segment.text && segment.end > segment.start);

  if (!clipSegments.length) return null;

  const assEvents = [];

  for (const segment of clipSegments) {
    const chunks = chunkWords(segment.text);
    if (!chunks.length) continue;

    const duration = Math.max(0.8, segment.end - segment.start);
    const chunkDuration = Math.max(0.7, duration / chunks.length);

    chunks.forEach((chunk, index) => {
      const start = segment.start + index * chunkDuration;

      const end = Math.min(
        segment.end,
        Math.max(start + 1.1, start + chunkDuration),
      );

      if (end <= start) return;
      if (end - start < 0.8) return;

      const text = `{\\an2\\pos(540,1560)\\fs58\\b1\\bord4\\shad0\\1c&HFFFFFF&\\3c&H000000&}${escapeAssText(
        chunk,
      )}`;

      assEvents.push(
        `Dialogue: 0,${toAssTime(start)},${toAssTime(end)},Caption,,90,90,0,,${text}`,
      );
    });
  }

  const assPath = path.join(outputDir, `captions_${clip.id}.ass`);

  const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,58,&H00FFFFFF,&H000000FF,&H00000000,&H99000000,-1,0,0,0,100,100,0,0,1,4,0,2,90,90,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${assEvents.join("\n")}
`;

  console.log("[CAPTION V2] Writing ASS captions:", assPath);
  console.log("[CAPTION V2] First event:", assEvents[0]);
  await writeFile(assPath, assContent, "utf8");

  return assPath;
}
