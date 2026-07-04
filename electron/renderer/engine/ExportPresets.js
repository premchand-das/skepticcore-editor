export const EXPORT_PRESETS = {
  reel: {
    width: 1080,
    height: 1920,
    fps: 30,
    videoCodec: "libx264",
    audioCodec: "aac",
    crf: "18",
    preset: "veryfast",
    pixelFormat: "yuv420p",
    audioBitrate: "192k",
  },

  landscape: {
    width: 1920,
    height: 1080,
    fps: 30,
    videoCodec: "libx264",
    audioCodec: "aac",
    crf: "18",
    preset: "veryfast",
    pixelFormat: "yuv420p",
    audioBitrate: "192k",
  },
};

export function getExportPreset(format = "reel") {
  return EXPORT_PRESETS[format] || EXPORT_PRESETS.reel;
}