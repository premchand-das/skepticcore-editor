"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipSuggestion,
  GenerateClipsPayload,
  MusicTrack,
  RenderedClip,
  studioApi,
  StudioProject,
  TemplateOption,
} from "@/app/lib/studioApi";

type ProgressState = {
  type: "idle" | "status" | "progress" | "done" | "error";
  message: string;
  percent?: string;
};

type ExportOptions = {
  format: "reel" | "landscape";
  layout: string;
  theme: string;
  captions: boolean;
  captionStyle: string;
  musicTrack: string;
  musicVolume: number;
};

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "reel",
  layout: "viral",
  theme: "cosmic",
  captions: true,
  captionStyle: "viral",
  musicTrack: "none",
  musicVolume: 0.12,
};

export function useStudio() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [project, setProject] = useState<StudioProject | null>(null);

  const [clips, setClips] = useState<ClipSuggestion[]>([]);
  const [renders, setRenders] = useState<RenderedClip[]>([]);

  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  const [exportOptions, setExportOptions] =
    useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  const [progress, setProgress] = useState<ProgressState>({
    type: "idle",
    message: "Ready.",
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const refreshActiveProject = useCallback(async () => {
    try {
      const result = await studioApi.getActiveProject();

      if (result.success && result.project) {
        setProject(result.project);
        setProjectName(result.project.name);
        setVideoUrl(result.project.media.previewUrl);
        setRenders(result.project.renders || []);
      }

      return result;
    } catch {
      return {
        success: false,
        message: "No active project.",
        project: null,
      };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = studioApi.onProgress((payload) => {
      setProgress({
        type: payload.type,
        message: payload.message,
        percent: payload.percent,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadCreativeOptions() {
      try {
        const [templateResult, musicResult] = await Promise.all([
          studioApi.listTemplates(),
          studioApi.listMusicTracks(),
        ]);

        if (templateResult.success) {
          setTemplates(templateResult.templates || []);
        }

        if (musicResult.success) {
          setMusicTracks(musicResult.tracks || []);
        }
      } catch (error) {
        setProgress({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load creative options.",
        });
      }
    }

    loadCreativeOptions();
    refreshActiveProject();
  }, [refreshActiveProject]);

  const hasVideo = Boolean(videoUrl);

  const canRender = useMemo(() => {
    return hasVideo && clips.length > 0 && !isRendering;
  }, [hasVideo, clips.length, isRendering]);

  const downloadVideo = useCallback(
    async (url: string) => {
      setIsDownloading(true);
      setProgress({
        type: "status",
        message: "Starting download...",
      });

      try {
        const result = await studioApi.downloadVideo(url);

        if (!result.success) {
          setProgress({
            type: "error",
            message: result.message || "Download failed.",
          });
          return result;
        }

        setVideoUrl(result.videoUrl || null);
        setProjectName(result.projectName || null);

        await refreshActiveProject();

        setProgress({
          type: "done",
          message: result.message || "Download complete.",
          percent: "100",
        });

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Download failed.";

        setProgress({
          type: "error",
          message,
        });

        return {
          success: false,
          message,
        };
      } finally {
        setIsDownloading(false);
      }
    },
    [refreshActiveProject]
  );

  const generateAiClips = useCallback(
    async (
      settings: {
        maxClips?: number;
        targetDuration?: number;
        style?: string;
      } = {}
    ) => {
      setIsGeneratingAi(true);
      setProgress({
        type: "status",
        message: "Generating AI clips...",
      });

      try {
        const result = await studioApi.generateAiClips(settings);

        if (!result.success) {
          setProgress({
            type: "error",
            message: result.message || "AI clip generation failed.",
          });
          return result;
        }

        setClips(result.clips || []);

        setProgress({
          type: "done",
          message: result.message || "AI clips generated.",
        });

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "AI clip generation failed.";

        setProgress({
          type: "error",
          message,
        });

        return {
          success: false,
          message,
          clips: [],
        };
      } finally {
        setIsGeneratingAi(false);
      }
    },
    []
  );

  const renderClips = useCallback(async () => {
    setIsRendering(true);
    setProgress({
      type: "status",
      message: "Rendering clips...",
    });

    const payload: GenerateClipsPayload = {
      clips,
      options: exportOptions,
    };

    try {
      const result = await studioApi.generateClips(payload);

      if (!result.success) {
        setProgress({
          type: "error",
          message: result.message || "Render failed.",
        });
        return result;
      }

      if (result.renders) {
        setRenders(result.renders);
      }

      await refreshActiveProject();

      setProgress({
        type: "done",
        message: result.message || "Render complete.",
        percent: "100",
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Render failed.";

      setProgress({
        type: "error",
        message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      setIsRendering(false);
    }
  }, [clips, exportOptions, refreshActiveProject]);

  const renderTopClips = useCallback(
  async (count: number) => {
    setIsRendering(true);
    setProgress({
      type: "status",
      message: `Rendering top ${count} clips...`,
    });

    const selectedClips = clips.slice(0, count);

    const payload: GenerateClipsPayload = {
      clips: selectedClips,
      options: exportOptions,
    };

    try {
      const result = await studioApi.generateClips(payload);

      if (!result.success) {
        setProgress({
          type: "error",
          message: result.message || "Render failed.",
        });
        return result;
      }

      await refreshActiveProject();

      setProgress({
        type: "done",
        message: result.message || `Top ${count} clips rendered.`,
        percent: "100",
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Render failed.";

      setProgress({
        type: "error",
        message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      setIsRendering(false);
    }
  },
  [clips, exportOptions, refreshActiveProject]
);

  const updateExportOption = useCallback(
    <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
      setExportOptions((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  return {
    videoUrl,
    projectName,
    project,
    renders,

    clips,
    setClips,

    templates,
    musicTracks,

    exportOptions,
    setExportOptions,
    updateExportOption,

    progress,

    isDownloading,
    isGeneratingAi,
    isRendering,

    hasVideo,
    canRender,

    refreshActiveProject,
    downloadVideo,
    generateAiClips,
    renderClips,
    renderTopClips,
  };
}