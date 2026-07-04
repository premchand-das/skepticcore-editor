export {};

export type AIClipStyle = "viral" | "debate" | "educational" | "skeptic";

export type AIClipSettings = {
  maxClips: number;
  targetDuration: number;
  style: AIClipStyle;
};

export type StudioClip = {
  id: string;
  start: string;
  end: string;
  title: string;
  reason?: string;
};

export type AIDirectorTranscriptSegment = {
  start: number;
  end?: number;
  duration?: number;
  text: string;
  speaker?: string;
};

export type AIDirectorClip = {
  id: string;
  start: number;
  end: number;
  duration: number;
  transcript: string;
  topic?: string | null;
  viralScore: number;
  reasoning: string[];
  warnings: string[];
};

export type AIDirectorResult = {
  version: string;
  totalSegments: number;
  totalCandidates: number;
  clips: AIDirectorClip[];
};

export type StudioResult<T = unknown> = {
  success: boolean;
  message: string;
} & T;

declare global {
  interface Window {
    skepticcore?: {
      downloadVideo: (url: string) => Promise<
        StudioResult<{
          projectName?: string;
          projectPath?: string;
          videoPath?: string;
          videoUrl?: string;
        }>
      >;

      generateClips: (payload: {
        clips: StudioClip[];
        options?: {
          musicTrack?: "none" | "documentary" | "dark" | "cinematic" | "ambient";
          musicVolume?: number;
          format?: "landscape" | "reel";
          captionStyle?: "clean" | "glass" | "viral" | "skepticcore";
          layout?: string;
          theme?: string;
          captions?: boolean;
        };
      }) => Promise<StudioResult>;

      aiGenerateClips: (
        settings: AIClipSettings
      ) => Promise<
        StudioResult<{
          clips: StudioClip[];
        }>
      >;

      aiDirectorAnalyze: (payload: {
        transcript: AIDirectorTranscriptSegment[];
        limit?: number;
      }) => Promise<AIDirectorResult>;

      listTemplates?: () => Promise<unknown>;

      listMusicTracks?: () => Promise<unknown>;

      getActiveProject?: () => Promise<unknown>;

      onDownloadProgress: (
        callback: (data: {
          type: "status" | "progress" | "error" | "done";
          message: string;
          percent?: string;
        }) => void
      ) => () => void;
    };
  }
}