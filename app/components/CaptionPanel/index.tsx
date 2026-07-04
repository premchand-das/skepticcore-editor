"use client";

type CaptionPanelProps = {
  captions: boolean;
  captionStyle: string;
  onCaptionsChange: (value: boolean) => void;
  onCaptionStyleChange: (value: string) => void;
};

export function CaptionPanel({
  captions,
  captionStyle,
  onCaptionsChange,
  onCaptionStyleChange,
}: CaptionPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">Captions</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Generate short-form captions from transcript or Whisper.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300">
          Enable captions
          <input
            type="checkbox"
            checked={captions}
            onChange={(event) => onCaptionsChange(event.target.checked)}
          />
        </label>

        <label className="grid gap-2 text-sm text-zinc-300">
          Caption style
          <select
            value={captionStyle}
            disabled={!captions}
            onChange={(event) => onCaptionStyleChange(event.target.value)}
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white disabled:opacity-40"
          >
            <option value="skepticcore">SkepticCore</option>
            <option value="viral">Viral</option>
            <option value="clean">Clean</option>
            <option value="glass">Glass</option>
          </select>
        </label>
      </div>
    </section>
  );
}