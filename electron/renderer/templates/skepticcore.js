export function skepticcoreTemplate() {
  const filterComplex =
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=32:2,eq=brightness=-0.18:saturation=1.15[bg];" +
    "color=c=#12001f:s=1080x1920:r=30,format=rgba,colorchannelmixer=aa=0.25[violet];" +
    "[bg][violet]overlay=0:0[brandbg];" +
    "[0:v]scale=970:1030:force_original_aspect_ratio=decrease[fg];" +
    "[brandbg][fg]overlay=(W-w)/2:310[base];" +
    "[base]drawtext=text='SkepticCore':x=70:y=95:fontsize=44:fontcolor=white," +
    "drawtext=text='QUESTION EVERYTHING':x=70:y=155:fontsize=22:fontcolor=#b88cff";

  return {
    name: "skepticcore",
    filterComplex,
  };
}