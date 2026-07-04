export function documentaryTemplate() {
  const filterComplex =
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.08:saturation=0.9[bg];" +
    "[0:v]scale=980:1100:force_original_aspect_ratio=decrease[fg];" +
    "[bg][fg]overlay=(W-w)/2:330[base];" +
    "[base]drawtext=text='SkepticCore':x=(w-text_w)/2:y=105:fontsize=42:fontcolor=white";

  return {
    name: "documentary",
    filterComplex,
  };
}