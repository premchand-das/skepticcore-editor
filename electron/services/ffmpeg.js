import path from "node:path";
import { getActiveProject, updateActiveProject } from "./projects.js";
import { buildRenderArgs, runRender } from "../renderer/renderEngine.js";
import { createClipSrt } from "../renderer/captions/srt.js";
import { safeFileName } from "../core/fs/safePath.js";

function sendProgress(event, payload) {
  event.sender.send("download-progress", payload);
}

export async function generateClips(event, clips, options = {}) {
  const active = await getActiveProject();

  if (!active?.project?.media?.videoPath) {
    return {
      success: false,
      message: "No project downloaded yet.",
    };
  }

  if (!Array.isArray(clips) || clips.length === 0) {
    return {
      success: false,
      message: "No clips provided.",
    };
  }

  const { project, paths } = active;

  const format = options.format || project.settings?.defaultFormat || "reel";
  const layout = options.layout || project.settings?.defaultLayout || "skepticcore";
  const captions = options.captions ?? true;
  const captionStyle =
    options.captionStyle ||
    project.settings?.defaultCaptionStyle ||
    "skepticcore";

  const theme = options.theme || "cosmic";
  const musicTrack =
    options.musicTrack ||
    project.settings?.defaultMusicTrack ||
    "none";

  const musicVolume = options.musicVolume ?? 0.12;

  await paths.ensureAll();

  const outputDir = paths.clipsDir();
  const renderedClips = [];

  for (const clip of clips) {
    const { id, start, end, title } = clip;

    if (!id || !start || !end || !title) continue;

    const suffix =
      format === "reel" ? `reel_${layout}_9x16` : "clip_landscape";

    const outputFile = path.join(
      outputDir,
      `${suffix}_${id}_${safeFileName(title)}.mp4`
    );

    sendProgress(event, {
      type: "status",
      message: `Rendering ${layout} ${format} ${id}...`,
    });

    const captionsPath =
      format === "reel" && captions
        ? await createClipSrt(event, clip, outputDir, { captionStyle })
        : null;

    const args = await buildRenderArgs({
      input: project.media.videoPath,
      output: outputFile,
      start,
      end,
      format,
      layout,
      theme,
      title,
      captionsPath,
      captionStyle,
      musicTrack,
      musicVolume,
    });

const result = await runRender(args);

if (!result.success) {
  return {
    success: false,
    message: `Failed to render clip ${id}.`,
    error: result.error,
  };
}

    renderedClips.push({
      clipId: id,
      title,
      start,
      end,
      format,
      layout,
      outputPath: outputFile,
      captionsPath,
      createdAt: new Date().toISOString(),
    });
  }

  await updateActiveProject((current) => ({
    ...current,
    clips: [
      ...(current.clips || []),
      ...clips,
    ],
    renders: [
      ...(current.renders || []),
      ...renderedClips,
    ],
  }));

  sendProgress(event, {
    type: "done",
    message: "Render complete.",
    percent: "100",
  });

  return {
    success: true,
    message: "All clips rendered successfully.",
    renders: renderedClips,
  };
}