"use client";

type ExportPanelProps = {
  canRender: boolean;
  isRendering: boolean;
  format: "reel" | "landscape";
  clipCount?: number;
  onFormatChange: (value: "reel" | "landscape") => void;
  onRender: () => Promise<unknown>;
  onRenderTop: (count: number) => Promise<unknown>;
};

export function ExportPanel({
  canRender,
  isRendering,
  format,
  clipCount = 0,
  onFormatChange,
  onRender,
  onRenderTop,
}: ExportPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">Export</h2>

      <p className="mt-1 text-sm text-zinc-400">
        Quickly render the best AI-selected reels.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-zinc-300">
          Format
          <select
            value={format}
            onChange={(event) =>
              onFormatChange(event.target.value as "reel" | "landscape")
            }
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
          >
            <option value="reel">Reel 9:16</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={!canRender || isRendering || clipCount < 1}
            onClick={() => onRenderTop(3)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Render Top 3
          </button>

          <button
            disabled={!canRender || isRendering || clipCount < 1}
            onClick={() => onRenderTop(5)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Render Top 5
          </button>
        </div>

        <button
          disabled={!canRender || isRendering}
          onClick={onRender}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRendering
            ? "Rendering..."
            : clipCount > 1
              ? `Render All ${clipCount} Clips`
              : "Render Clip"}
        </button>
      </div>
    </section>
  );
}