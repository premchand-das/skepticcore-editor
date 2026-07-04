import path from "node:path";
import { rootDir } from "../config/paths.js";
import { exists } from "../core/fs/fileSystem.js";
import { spawn } from "node:child_process";
import { ffmpegPath } from "../config/paths.js";
import {
  createProject,
  findDownloadedMp4,
  updateActiveProject,
} from "./projects.js";
import { toPreviewUrl } from "./preview.js";

function sendProgress(event, payload) {
  event.sender.send("download-progress", payload);
}

function normalizeYtDlpError(stderr = "") {
  const text = String(stderr);

  if (
    text.includes("Sign in to confirm") ||
    text.includes("not a bot") ||
    text.includes("Use --cookies") ||
    text.includes("confirm you")
  ) {
    return {
      code: "YOUTUBE_BLOCKED",
      message:
        "YouTube blocked this video with sign-in or bot verification. Try another public video.",
    };
  }

  if (
    text.includes("Private video") ||
    text.includes("This video is private")
  ) {
    return {
      code: "PRIVATE_VIDEO",
      message: "This video is private and cannot be downloaded.",
    };
  }

  if (
    text.includes("Video unavailable") ||
    text.includes("This video is unavailable")
  ) {
    return {
      code: "VIDEO_UNAVAILABLE",
      message: "This video is unavailable.",
    };
  }

  if (
    text.includes("Unsupported URL") ||
    text.includes("is not a valid URL")
  ) {
    return {
      code: "INVALID_URL",
      message: "Please provide a valid YouTube video URL.",
    };
  }

  if (text.includes("ffmpeg not found")) {
    return {
      code: "FFMPEG_NOT_FOUND",
      message:
        "FFmpeg was not found. Check that tools/ffmpeg/ffmpeg.exe exists.",
    };
  }

  return {
    code: "DOWNLOAD_FAILED",
    message: "Download failed. Try another public YouTube video.",
  };
}

async function buildYtDlpArgs({ projectPath, youtubeUrl, safeMode = false }) {
  const outputTemplate = path.join(projectPath, "video.%(ext)s");
  const cookiesPath = path.join(rootDir, "cookies.txt");
const hasCookies = await exists(cookiesPath);

  const baseArgs = [
    "-m",
    "yt_dlp",
    "--js-runtimes",
"node",
"--remote-components",
"ejs:github",

...(hasCookies ? ["--cookies", cookiesPath] : []),

    "--no-playlist",
    "--no-part",

    "--force-overwrites",
    "--fixup",
"never",
    "--windows-filenames",

    "--write-auto-sub",
    "--write-sub",
    "--sub-lang",
    "en,en-US,en-GB",
    "--sub-format",
    "vtt/srt/json3",
    "--no-abort-on-error",

    "--merge-output-format",
    "mp4",
    "--ffmpeg-location",
    ffmpegPath,

    "-o",
    outputTemplate,
  ];

  if (safeMode) {
    return [
      ...baseArgs,
      "-f",
      "b[height<=720][ext=mp4]/b[ext=mp4]/18/best",
      youtubeUrl,
    ];
  }

  return [
    ...baseArgs,

    "-S",
    "res:1080,fps,codec:h264:m4a",

    "-f",
    "bv*[height<=1080][vcodec^=avc1]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b[ext=mp4]/best",

    youtubeUrl,
  ];
}

function runYtDlp(event, args, label) {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let finished = false;

    console.log("[yt-dlp] command:", "python", args.join(" "));

    sendProgress(event, {
      type: "status",
      message: label,
    });

    const ytDlp = spawn("python", args, {
      shell: false,
      windowsHide: false,
    });

    const timeout = setTimeout(() => {
      if (finished) return;

      finished = true;

      try {
        ytDlp.kill("SIGKILL");
      } catch {}

      resolve({
        success: false,
        code: "TIMEOUT",
        stdout,
        stderr:
          stderr ||
          "yt-dlp timed out. It may be stuck reading cookies or solving YouTube challenge.",
      });
    }, 120000);

    ytDlp.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      console.log("[yt-dlp stdout]", text);

      sendProgress(event, {
        type: "status",
        message: text.slice(0, 180),
      });

      const percentMatch = text.match(/\[download\]\s+([\d.]+)%/);

      if (percentMatch) {
        sendProgress(event, {
          type: "progress",
          message: `Downloading... ${percentMatch[1]}%`,
          percent: percentMatch[1],
        });
      }
    });

    ytDlp.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      console.error("[yt-dlp stderr]", text);

      sendProgress(event, {
        type: "status",
        message: text.slice(0, 180),
      });
    });

    ytDlp.on("error", (error) => {
      if (finished) return;

      finished = true;
      clearTimeout(timeout);

      resolve({
        success: false,
        code: -1,
        stdout,
        stderr: error.message,
      });
    });

    ytDlp.on("close", (code) => {
      if (finished) return;

      finished = true;
      clearTimeout(timeout);

      resolve({
        success: code === 0,
        code,
        stdout,
        stderr,
      });
    });
  });
}

export async function downloadYoutubeVideo(event, youtubeUrl) {
  const { projectName, projectPath } = await createProject();

  sendProgress(event, {
    type: "status",
    message: "Creating project folder...",
  });

  const primaryArgs = await buildYtDlpArgs({
    projectPath,
    youtubeUrl,
    safeMode: false,
  });

  let result = await runYtDlp(
    event,
    primaryArgs,
    "Downloading YouTube video..."
  );

  if (!result.success) {
    const normalized = normalizeYtDlpError(result.stderr);

    if (normalized.code === "DOWNLOAD_FAILED") {
      sendProgress(event, {
        type: "status",
        message: "Primary download failed. Retrying with safe format...",
      });

      const safeArgs = await buildYtDlpArgs({
        projectPath,
        youtubeUrl,
        safeMode: true,
      });

      result = await runYtDlp(
        event,
        safeArgs,
        "Retrying with safe YouTube format..."
      );
    }
  }

  if (!result.success) {
    const normalized = normalizeYtDlpError(result.stderr);

    sendProgress(event, {
      type: "error",
      message: normalized.message,
    });

    return {
      success: false,
      code: normalized.code,
      message: normalized.message,
      error: result.stderr,
    };
  }

  const videoPath = await findDownloadedMp4(projectPath);

  if (!videoPath) {
    return {
      success: false,
      code: "MP4_NOT_FOUND",
      message: "Download completed, but MP4 file was not found.",
    };
  }

  const videoUrl = toPreviewUrl(videoPath);

  await updateActiveProject((project) => ({
    ...project,
    source: {
      ...project.source,
      type: "youtube",
      url: youtubeUrl,
    },
    media: {
      ...project.media,
      videoPath,
      previewUrl: videoUrl,
    },
  }));

  sendProgress(event, {
    type: "done",
    message: "Download complete.",
    percent: "100",
  });

  return {
    success: true,
    message: `Download complete. Saved in projects/${projectName}`,
    projectName,
    projectPath,
    videoPath,
    videoUrl,
  };
}