"use client";

type VideoPlayerProps = {
  videoUrl: string | null;
};

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-4">
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Download a video to preview it here.
          </div>
        )}
      </div>
    </section>
  );
}