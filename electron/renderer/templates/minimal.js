export function minimalTemplate() {
  return {
    name: "minimal",
    videoFilter:
      "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
  };
}