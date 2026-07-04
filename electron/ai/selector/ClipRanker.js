import { scoreViralCandidate } from "../scoring/ViralScore.js";

function titleFromText(text = "", index = 0) {
  const sentence =
    text
      .split(/[.!?]/)
      .map((item) => item.trim())
      .find((item) => item.length > 18) || `SkepticCore Clip ${index + 1}`;

  return sentence
    .replace(/[^\w\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 78);
}

export function rankClips(candidates, options = {}) {
  const maxClips = Number(options.maxClips || 5);

  return candidates
    .map((candidate, index) => {
      const score = scoreViralCandidate(candidate);

      return {
        ...candidate,
        viralScore: score.total,
        scoreBreakdown: score.breakdown,
        reasons: score.reasons,
        title: titleFromText(candidate.text, index),
      };
    })
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, maxClips)
    .map((clip, index) => ({
      id: String(index + 1).padStart(3, "0"),
      start: clip.start,
      end: clip.end,
      title: clip.title,
      reason: `${clip.viralScore}/100 · ${clip.reasons.slice(0, 2).join(" · ")}`,
      viralScore: clip.viralScore,
      scoreBreakdown: clip.scoreBreakdown,
      reasons: clip.reasons,
    }));
}