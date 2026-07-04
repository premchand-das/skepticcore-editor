import path from "node:path";
import { rootDir } from "../../config/paths.js";
import { exists } from "../../core/fs/fileSystem.js";

const MUSIC_TRACKS = {
  none: null,
  documentary: {
    id: "documentary",
    name: "Documentary",
    fileName: "documentary.mp3",
    defaultVolume: 0.12,
  },
  dark: {
    id: "dark",
    name: "Dark Ambient",
    fileName: "dark.mp3",
    defaultVolume: 0.1,
  },
  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    fileName: "cinematic.mp3",
    defaultVolume: 0.12,
  },
  ambient: {
    id: "ambient",
    name: "Ambient",
    fileName: "ambient.mp3",
    defaultVolume: 0.08,
  },
};

export function listMusicTracks() {
  return Object.values(MUSIC_TRACKS).filter(Boolean);
}

export function getMusicTrack(track = "none") {
  return MUSIC_TRACKS[track] || null;
}

export async function resolveMusicTrack(track = "none") {
  const selected = getMusicTrack(track);

  if (!selected) {
    return null;
  }

  const musicPath = path.join(rootDir, "assets", "music", selected.fileName);

  if (!(await exists(musicPath))) {
    return null;
  }

  return musicPath;
}