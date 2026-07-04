"use client";

import type { RenderedClip } from "@/app/lib/studioApi";

type RenderedClipsPanelProps = {
  renders: RenderedClip[];
};

export function RenderedClipsPanel({ renders }: RenderedClipsPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Rendered Clips</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Exported files from the active project.
        </p>
      </div>

      {!renders.length ? (
        <p className="text-sm text-zinc-500">No rendered clips yet.</p>
      ) : (
        <div className="grid gap-3">
          {renders.map((render, index) => (
            <div
              key={`${render.outputPath}-${index}`}
              className="rounded-2xl border border-white/10 bg-black p-4"
            >
              <h3 className="text-sm font-semibold text-white">
                {render.title}
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                {render.start} → {render.end} · {render.format} ·{" "}
                {render.layout}
              </p>

              <p className="mt-3 break-all text-xs text-zinc-500">
                {render.outputPath}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}