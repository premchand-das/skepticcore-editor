function escapeSubtitlePath(filePath) {
  return String(filePath)
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");
}

export function buildCaptionFilter({ captionsPath }) {
  if (!captionsPath) return null;

  const safePath = escapeSubtitlePath(captionsPath);

  return `subtitles=filename='${safePath}'`;
}