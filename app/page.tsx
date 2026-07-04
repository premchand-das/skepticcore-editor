"use client";

import { useState } from "react";
import { useStudio } from "@/app/hooks/useStudio";

import { VideoPlayer } from "@/app/components/VideoPlayer";
import { AIControls } from "@/app/components/AIControls";
import { ClipList } from "@/app/components/ClipList";
import { TemplatePanel } from "@/app/components/TemplatePanel";
import { MusicPanel } from "@/app/components/MusicPanel";
import { CaptionPanel } from "@/app/components/CaptionPanel";
import { ExportPanel } from "@/app/components/ExportPanel";
import { RenderedClipsPanel } from "./components/RenderedClipsPanel";

export default function StudioPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const studio = useStudio();

  return (
    <main className="min-h-screen bg-black px-6 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300">
              SkepticCore Studio
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              Phase 2 Creator Engine
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Download long-form videos, generate AI clip suggestions, apply
              templates, captions, music, and export polished short-form clips.
            </p>
          </div>

          {studio.projectName ? (
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-400">
              Project: {studio.projectName}
            </div>
          ) : null}
        </header>

        <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="Paste YouTube URL..."
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <button
              disabled={!youtubeUrl || studio.isDownloading}
              onClick={() => studio.downloadVideo(youtubeUrl)}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {studio.isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-500">
            <p>{studio.progress.message}</p>
            {studio.progress.percent ? <p>{studio.progress.percent}%</p> : null}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <VideoPlayer videoUrl={studio.videoUrl} />

            <ClipList clips={studio.clips} setClips={studio.setClips} />

            <RenderedClipsPanel renders={studio.renders} />
          </div>

          <aside className="grid gap-6">
            <AIControls
              disabled={!studio.hasVideo}
              isGenerating={studio.isGeneratingAi}
              onGenerate={studio.generateAiClips}
            />

            <TemplatePanel
              templates={studio.templates}
              value={studio.exportOptions.layout}
              onChange={(value) => studio.updateExportOption("layout", value)}
            />

            <CaptionPanel
              captions={studio.exportOptions.captions}
              captionStyle={studio.exportOptions.captionStyle}
              onCaptionsChange={(value) =>
                studio.updateExportOption("captions", value)
              }
              onCaptionStyleChange={(value) =>
                studio.updateExportOption("captionStyle", value)
              }
            />

            <MusicPanel
              tracks={studio.musicTracks}
              selectedTrack={studio.exportOptions.musicTrack}
              volume={studio.exportOptions.musicVolume}
              onTrackChange={(value) =>
                studio.updateExportOption("musicTrack", value)
              }
              onVolumeChange={(value) =>
                studio.updateExportOption("musicVolume", value)
              }
            />

<ExportPanel
  canRender={studio.canRender}
  isRendering={studio.isRendering}
  clipCount={studio.clips.length}
  format={studio.exportOptions.format}
  onFormatChange={(value) =>
    studio.updateExportOption("format", value)
  }
  onRender={studio.renderClips}
  onRenderTop={studio.renderTopClips}
/>
          </aside>
        </div>
      </div>
    </main>
  );
}