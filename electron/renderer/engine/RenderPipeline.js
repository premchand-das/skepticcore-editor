import { getExportPreset } from "./ExportPresets.js";
import { buildLayoutFilter } from "./LayoutEngine.js";
import { buildBrandingFilters } from "./BrandingEngine.js";
import { buildCaptionFilter } from "./CaptionEngine.js";
import { buildAudioFilter } from "./AudioEngine.js";
import { resolveMusicTrack } from "../music/library.js";

export async function buildRenderPipeline({
  input,
  output,
  start,
  end,
  format,
  layout,
  title,
  captionsPath,
  captionStyle,
  musicTrack,
  musicVolume,
}) {
  const preset = getExportPreset(format);
  const musicPath = await resolveMusicTrack(musicTrack);
  const hasMusic = Boolean(musicPath);

  const args = [
    "-y",
    "-hide_banner",
    "-ss",
    start,
    "-to",
    end,
    "-i",
    input,
  ];

  if (hasMusic) {
    args.push("-stream_loop", "-1", "-i", musicPath);
  }

  const videoFilters = [
    buildLayoutFilter({ format, layout }),
    ...buildBrandingFilters({ format, layout, title }),
    buildCaptionFilter({ captionsPath, captionStyle }),
  ].filter(Boolean);

  const audioFilter = buildAudioFilter({
    hasMusic,
    musicVolume,
  });

  if (videoFilters.length || audioFilter) {
    const filterParts = [];

    if (videoFilters.length) {
      filterParts.push(`${videoFilters.join(",")}[vout]`);
    }

    if (audioFilter) {
      filterParts.push(audioFilter);
    }

    args.push("-filter_complex", filterParts.join(";"));
    args.push("-map", videoFilters.length ? "[vout]" : "0:v");
    args.push("-map", audioFilter ? "[aout]" : "0:a?");
  } else {
    args.push("-map", "0:v", "-map", "0:a?");
  }

  args.push(
    "-r",
    String(preset.fps),
    "-c:v",
    preset.videoCodec,
    "-preset",
    preset.preset,
    "-crf",
    preset.crf,
    "-pix_fmt",
    preset.pixelFormat,
    "-c:a",
    preset.audioCodec,
    "-b:a",
    preset.audioBitrate,
    "-shortest",
    "-movflags",
    "+faststart",
    output
  );

  return args;
}