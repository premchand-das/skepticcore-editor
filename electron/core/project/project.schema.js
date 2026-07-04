export function createProjectSchema({ id, name, projectPath }) {
  const now = new Date().toISOString();

  return {
    id,
    name,
    projectPath,

    source: {
      type: null,
      url: null,
      title: null,
    },

    media: {
      videoPath: null,
      audioPath: null,
      previewUrl: null,
      duration: null,
    },

    transcript: {
      source: null,
      path: null,
      segments: 0,
      available: false,
    },

    clips: [],

    renders: [],

    settings: {
      defaultFormat: "reel",
      defaultLayout: "skepticcore",
      defaultCaptionStyle: "skepticcore",
      defaultMusicTrack: "none",
    },

    createdAt: now,
    updatedAt: now,
  };
}