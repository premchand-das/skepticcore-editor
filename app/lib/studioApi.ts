export type ApiResult<T = unknown> = {
  success: boolean;
  message?: string;
} & T;

export type DownloadResult = ApiResult<{
  projectName?: string;
  projectPath?: string;
  videoPath?: string;
  videoUrl?: string;
}>;

export type ClipSuggestion = {
  id: string;
  start: string;
  end: string;
  title: string;
  reason?: string;
};

export type RenderedClip = {
  clipId: string;
  title: string;
  start: string;
  end: string;
  format: string;
  layout: string;
  outputPath: string;
  captionsPath?: string | null;
  createdAt: string;
};

export type StudioProject = {
  id: string;
  name: string;
  projectPath: string;
  source: {
    type: string | null;
    url: string | null;
    title: string | null;
  };
  media: {
    videoPath: string | null;
    audioPath: string | null;
    previewUrl: string | null;
    duration: number | null;
  };
  transcript: {
    source: string | null;
    path: string | null;
    segments: number;
    available: boolean;
  };
  clips: ClipSuggestion[];
  renders: RenderedClip[];
};

export type GenerateClipsPayload = {
  clips: ClipSuggestion[];
  options?: {
    format?: "reel" | "landscape";
    layout?: string;
    theme?: string;
    captions?: boolean;
    captionStyle?: string;
    musicTrack?: string;
    musicVolume?: number;
  };
};

export type TemplateOption = {
  id: string;
  name: string;
  supportsReel: boolean;
  supportsLandscape: boolean;
};

export type MusicTrack = {
  id: string;
  name: string;
  fileName: string;
  defaultVolume: number;
};

declare global {
  interface Window {
    electronAPI?: {
      downloadVideo: (url: string) => Promise<DownloadResult>;

      generateClips: (
        payload: GenerateClipsPayload | ClipSuggestion[]
      ) => Promise<ApiResult<{ renders?: RenderedClip[] }>>;

      generateAiClips: (settings: {
        maxClips?: number;
        targetDuration?: number;
        style?: string;
      }) => Promise<ApiResult<{ clips: ClipSuggestion[] }>>;

      listTemplates: () => Promise<ApiResult<{ templates: TemplateOption[] }>>;

      listMusicTracks: () => Promise<ApiResult<{ tracks: MusicTrack[] }>>;

      getActiveProject: () =>
        Promise<ApiResult<{ project: StudioProject | null }>>;

      onDownloadProgress: (
        callback: (payload: {
          type: "status" | "progress" | "done" | "error";
          message: string;
          percent?: string;
        }) => void
      ) => () => void;
    };
  }
}

function getElectronApi() {
  if (typeof window === "undefined" || !window.electronAPI) {
    return null;
  }

  return window.electronAPI;
}

export const studioApi = {
  downloadVideo(url: string) {
    const api = getElectronApi();
    if (!api) return Promise.resolve({ success: false, message: "Open this app with Electron." });
    return api.downloadVideo(url);
  },

  generateClips(payload: GenerateClipsPayload | ClipSuggestion[]) {
    const api = getElectronApi();
    if (!api) return Promise.resolve({ success: false, message: "Open this app with Electron." });
    return api.generateClips(payload);
  },

  generateAiClips(settings: {
    maxClips?: number;
    targetDuration?: number;
    style?: string;
  }) {
    const api = getElectronApi();
    if (!api) {
      return Promise.resolve({
        success: false,
        message: "Open this app with Electron.",
        clips: [],
      });
    }

    return api.generateAiClips(settings);
  },

  listTemplates() {
    const api = getElectronApi();
    if (!api) return Promise.resolve({ success: true, templates: [] });
    return api.listTemplates();
  },

  listMusicTracks() {
    const api = getElectronApi();
    if (!api) return Promise.resolve({ success: true, tracks: [] });
    return api.listMusicTracks();
  },

  getActiveProject() {
    const api = getElectronApi();
    if (!api) {
      return Promise.resolve({
        success: false,
        message: "No active Electron project.",
        project: null,
      });
    }

    return api.getActiveProject();
  },

  onProgress(
    callback: (payload: {
      type: "status" | "progress" | "done" | "error";
      message: string;
      percent?: string;
    }) => void
  ) {
    const api = getElectronApi();

    if (!api) {
      callback({
        type: "status",
        message: "Browser preview mode. Run npm run electron to use desktop features.",
      });

      return () => {};
    }

    return api.onDownloadProgress(callback);
  },
};