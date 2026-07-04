"use client";

import type { TemplateOption } from "@/app/lib/studioApi";

type TemplatePanelProps = {
  templates: TemplateOption[];
  value: string;
  onChange: (value: string) => void;
};

export function TemplatePanel({
  templates,
  value,
  onChange,
}: TemplatePanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">Template</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Choose the visual layout for exported clips.
      </p>

      <div className="mt-5 grid gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={[
              "rounded-2xl border px-4 py-3 text-left transition",
              value === template.id
                ? "border-white bg-white text-black"
                : "border-white/10 bg-black text-white hover:border-white/30",
            ].join(" ")}
          >
            <div className="text-sm font-semibold">{template.name}</div>
            <div
              className={[
                "mt-1 text-xs",
                value === template.id ? "text-black/60" : "text-zinc-500",
              ].join(" ")}
            >
              {template.supportsReel ? "Reel" : ""}
              {template.supportsReel && template.supportsLandscape ? " + " : ""}
              {template.supportsLandscape ? "Landscape" : ""}
            </div>
          </button>
        ))}

        {!templates.length ? (
          <p className="text-sm text-zinc-500">No templates found.</p>
        ) : null}
      </div>
    </section>
  );
}