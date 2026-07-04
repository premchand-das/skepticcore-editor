"use client";

import type { MusicTrack } from "@/app/lib/studioApi";

type MusicPanelProps = {
  tracks: MusicTrack[];
  selectedTrack: string;
  volume: number;
  onTrackChange: (track: string) => void;
  onVolumeChange: (volume: number) => void;
};

export function MusicPanel({
  tracks,
  selectedTrack,
  volume,
  onTrackChange,
  onVolumeChange,
}: MusicPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">Music</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Add low-volume background music to exports.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-zinc-300">
          Track
          <select
            value={selectedTrack}
            onChange={(event) => onTrackChange(event.target.value)}
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
          >
            <option value="none">None</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-300">
          Volume: {volume.toFixed(2)}
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}