export function podcastTemplate() {
  const filterComplex =
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=22:2,eq=brightness=-0.1:saturation=0.85[bg];" +
    "[0:v]scale=1000:780:force_original_aspect_ratio=decrease[fg];" +
    "[bg][fg]overlay=(W-w)/2:260[base];" +
    "[base]drawtext=text='SkepticCore':x=(w-text_w)/2:y=105:fontsize=42:fontcolor=white";

  return {
    name: "podcast",
    filterComplex,
  };
}