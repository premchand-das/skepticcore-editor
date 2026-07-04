export function buildLayoutFilter({ format = "reel", layout = "viral" }) {
  if (format !== "reel") {
    return [
      "scale=1920:1080:force_original_aspect_ratio=increase",
      "crop=1920:1080",
      "setsar=1",
    ].join(",");
  }

  if (layout === "minimal") {
    return [
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
      "setsar=1",
    ].join(",");
  }

  return [
    "scale=1080:1920:force_original_aspect_ratio=increase",
    "crop=1080:1920",
    "eq=contrast=1.08:brightness=-0.02:saturation=1.12",
    "unsharp=5:5:0.65:5:5:0.0",
    "setsar=1",
  ].join(",");
}