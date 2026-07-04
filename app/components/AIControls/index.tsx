"use client";

import { useState } from "react";

type AIControlsProps = {
  disabled?: boolean;
  isGenerating?: boolean;
  onGenerate: (settings: {
    maxClips?: number;
    targetDuration?: number;
    style?: string;
  }) => Promise<unknown>;
};

export function AIControls({
  disabled,
  isGenerating,
  onGenerate,
}: AIControlsProps) {
  const [style, setStyle] = useState("viral");
  const [maxClips, setMaxClips] = useState(4);
  const [targetDuration, setTargetDuration] = useState(45);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">AI Clip Selector</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Generate clip suggestions from transcript or Whisper fallback.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm text-zinc-300">
          Style
          <select
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
          >
            <option value="viral">Viral</option>
            <option value="debate">Debate</option>
            <option value="educational">Educational</option>
            <option value="skeptic">Skeptic</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-300">
          Max clips
          <input
            type="number"
            min={1}
            max={12}
            value={maxClips}
            onChange={(event) => setMaxClips(Number(event.target.value))}
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
          />
        </label>

        <label className="grid gap-2 text-sm text-zinc-300">
          Target duration
          <input
            type="number"
            min={15}
            max={120}
            value={targetDuration}
            onChange={(event) =>
              setTargetDuration(Number(event.target.value))
            }
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
          />
        </label>

        <button
          disabled={disabled || isGenerating}
          onClick={() =>
            onGenerate({
              style,
              maxClips,
              targetDuration,
            })
          }
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isGenerating ? "Generating..." : "Generate AI Clips"}
        </button>
      </div>
    </section>
  );
}