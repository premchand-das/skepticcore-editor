export function buildAudioFilter({ hasMusic, musicVolume }) {
  if (!hasMusic) return null;

  const volume = Number.isFinite(Number(musicVolume))
    ? Math.max(0, Math.min(Number(musicVolume), 0.5))
    : 0.12;

  return [
    `[1:a]aloop=loop=-1:size=2e+09,volume=${volume},afade=t=in:st=0:d=1.2[music]`,
    `[0:a]volume=1.0[voice]`,
    `[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
  ].join(";");
}