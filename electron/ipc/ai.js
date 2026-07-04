import { ipcMain } from "electron";
import { spawn } from "node:child_process";
import { ffmpegPath } from "../config/paths.js";
import { getActiveProject } from "../services/projects.js";
import { readTranscriptSegments, secondsToTime } from "../services/transcript.js";
import {
  transcribeWithWhisper,
  readWhisperSegments,
} from "../services/whisper.js";

import { buildCandidateSegments } from "../ai/analyzer/SegmentBuilder.js";
import { rankClips } from "../ai/selector/ClipRanker.js";

const DEFAULT_SETTINGS = {
  maxClips: 5,
  targetDuration: 45,
  style: "viral",
};

function normalizeSettings(settings = {}) {
  return {
    maxClips: Number(settings.maxClips || DEFAULT_SETTINGS.maxClips),
    targetDuration: Number(
      settings.targetDuration || DEFAULT_SETTINGS.targetDuration
    ),
    style: settings.style || DEFAULT_SETTINGS.style,
  };
}

function getVideoDuration(videoPath) {
  return new Promise((resolve) => {
    const ffprobePath = ffmpegPath.replace("ffmpeg.exe", "ffprobe.exe");

    const ffprobe = spawn(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    let output = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", () => {
      const duration = Number(output.trim());
      resolve(Number.isFinite(duration) ? duration : 0);
    });
  });
}

function generateFallbackClips(duration, settings) {
  const clips = [];
  const clipLength = settings.targetDuration;
  const gap = Math.max(20, Math.floor(clipLength * 0.7));

  let start = 0;

  while (start + 15 < duration && clips.length < settings.maxClips) {
    const end = Math.min(start + clipLength, duration);

    clips.push({
      id: String(clips.length + 1).padStart(3, "0"),
      start: secondsToTime(start),
      end: secondsToTime(end),
      title: `${settings.style} Auto Clip ${clips.length + 1}`,
      reason: `Fallback clip · ${Math.round(end - start)}s`,
      viralScore: 0,
      reasons: ["No transcript available"],
      scoreBreakdown: {},
    });

    start += gap;
  }

  return clips;
}

async function getBestTranscript(event, project) {
  const youtubeTranscript = await readTranscriptSegments(project.projectPath);

  if (youtubeTranscript.success && youtubeTranscript.segments.length) {
    return {
      source: "youtube",
      segments: youtubeTranscript.segments,
      message: youtubeTranscript.message,
    };
  }

  const whisper = await transcribeWithWhisper(
    event,
    project.projectPath,
    project.media.videoPath
  );

  if (whisper.success) {
    const whisperSegments = await readWhisperSegments(whisper.transcriptPath);

    if (whisperSegments.length) {
      return {
        source: "whisper",
        segments: whisperSegments,
        message: "Using Whisper transcript.",
      };
    }
  }

  return {
    source: null,
    segments: [],
    message: "No usable transcript found.",
  };
}

function generateAiDirectorClips(segments, settings) {
  const candidates = buildCandidateSegments(segments, {
    targetDuration: settings.targetDuration,
  });

  const ranked = rankClips(candidates, {
    maxClips: settings.maxClips,
    style: settings.style,
  });

  return ranked;
}

export function registerAiIpc() {
  ipcMain.handle("ai-generate-clips", async (event, settingsInput) => {
    const settings = normalizeSettings(settingsInput);
    const active = await getActiveProject();

    if (!active?.project?.media?.videoPath) {
      return {
        success: false,
        message: "Download a video first.",
        clips: [],
      };
    }

    const { project } = active;

    event.sender.send("download-progress", {
      type: "status",
      message: "AI Director is reading transcript...",
    });

    const transcript = await getBestTranscript(event, project);

    if (transcript.segments.length) {
      event.sender.send("download-progress", {
        type: "status",
        message: "AI Director is scoring viral moments...",
      });

      const clips = generateAiDirectorClips(transcript.segments, settings);

      if (clips.length) {
        return {
          success: true,
          message: `AI Director selected ${clips.length} clips from ${transcript.source} transcript.`,
          clips,
        };
      }
    }

    const duration = await getVideoDuration(project.media.videoPath);

    if (!duration) {
      return {
        success: false,
        message: "AI Director could not read transcript or video duration.",
        clips: [],
      };
    }

    return {
      success: true,
      message: "No transcript found, so generated fallback timed clips.",
      clips: generateFallbackClips(duration, settings),
    };
  });
}