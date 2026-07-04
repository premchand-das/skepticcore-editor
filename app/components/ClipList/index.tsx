"use client";

import type { ClipSuggestion } from "@/app/lib/studioApi";

type ClipListProps = {
  clips: ClipSuggestion[];
  setClips: (clips: ClipSuggestion[]) => void;
};

type ScoredClip = ClipSuggestion & {
  viralScore?: number;
  reasons?: string[];
  scoreBreakdown?: Record<string, number>;
};

function scoreColor(score?: number) {
  if (!score) return "text-zinc-500";
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-300";
  return "text-zinc-400";
}

export function ClipList({ clips, setClips }: ClipListProps) {
  const scoredClips = clips as ScoredClip[];

  function updateClip(index: number, patch: Partial<ClipSuggestion>) {
    setClips(
      clips.map((clip, currentIndex) =>
        currentIndex === index ? { ...clip, ...patch } : clip
      )
    );
  }

  function removeClip(index: number) {
    setClips(clips.filter((_, currentIndex) => currentIndex !== index));
  }

  if (!clips.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold text-white">AI Selected Clips</h2>
        <p className="mt-2 text-sm text-zinc-500">
          No clips yet. Download a video and let AI Director find the best moments.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            AI Selected Clips
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ranked by hook strength, curiosity, educational value, and reel length.
          </p>
        </div>

        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
          {clips.length} clips
        </span>
      </div>

      <div className="grid gap-3">
        {scoredClips.map((clip, index) => (
          <div
            key={`${clip.id}-${index}`}
            className="rounded-2xl border border-white/10 bg-black p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-black">
                    #{index + 1}
                  </span>

                  {typeof clip.viralScore === "number" ? (
                    <span
                      className={`text-xs font-bold ${scoreColor(
                        clip.viralScore
                      )}`}
                    >
                      {clip.viralScore}/100
                    </span>
                  ) : null}
                </div>

                <input
                  value={clip.title}
                  onChange={(event) =>
                    updateClip(index, { title: event.target.value })
                  }
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                />
              </div>

              <button
                onClick={() => removeClip(index)}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs text-zinc-500">
                Start
                <input
                  value={clip.start}
                  onChange={(event) =>
                    updateClip(index, { start: event.target.value })
                  }
                  className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="grid gap-1 text-xs text-zinc-500">
                End
                <input
                  value={clip.end}
                  onChange={(event) =>
                    updateClip(index, { end: event.target.value })
                  }
                  className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            {clip.reasons?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {clip.reasons.slice(0, 4).map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-400"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            ) : clip.reason ? (
              <p className="mt-3 text-xs text-zinc-500">{clip.reason}</p>
            ) : null}

            {clip.scoreBreakdown ? (
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[10px] text-zinc-500">
                {Object.entries(clip.scoreBreakdown).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-2"
                  >
                    <div className="font-semibold text-zinc-300">{value}</div>
                    <div className="mt-1 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}