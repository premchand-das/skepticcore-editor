import { detectHook } from "../analyzer/HookDetector.js";
import { detectCuriosity } from "../analyzer/CuriosityDetector.js";

function detectEducationalValue(text = "") {
  const lower = text.toLowerCase();

  const signals = [
    "because",
    "therefore",
    "means",
    "example",
    "understand",
    "explain",
    "process",
    "theory",
    "science",
    "evidence",
    "argument",
  ];

  const hits = signals.filter((word) => lower.includes(word)).length;

  return {
    score: Math.min(hits * 4, 25),
    reasons: hits ? ["Educational explanation"] : [],
  };
}

function detectEndingStrength(text = "") {
  const sentences = text.split(/[.!?]/).map((item) => item.trim()).filter(Boolean);
  const last = sentences.at(-1) || "";

  let score = 0;

  if (last.length > 25) score += 5;
  if (/\btherefore\b|\bthis means\b|\bso\b|\bthat is why\b/i.test(last)) score += 8;
  if (text.length > 220 && text.length < 1000) score += 5;

  return {
    score: Math.min(score, 15),
    reasons: score > 6 ? ["Good ending structure"] : [],
  };
}

export function scoreViralCandidate(candidate) {
  const hook = detectHook(candidate.text);
  const curiosity = detectCuriosity(candidate.text);
  const education = detectEducationalValue(candidate.text);
  const ending = detectEndingStrength(candidate.text);

  const durationScore =
    candidate.duration >= 25 && candidate.duration <= 65
      ? 15
      : candidate.duration < 20
        ? 4
        : 8;

  const total =
    hook.score +
    curiosity.score +
    education.score +
    ending.score +
    durationScore;

  const reasons = [
    ...hook.reasons,
    ...curiosity.reasons,
    ...education.reasons,
    ...ending.reasons,
    candidate.duration >= 25 && candidate.duration <= 65
      ? "Good reel length"
      : null,
  ].filter(Boolean);

  return {
    total: Math.min(total, 100),
    breakdown: {
      hook: hook.score,
      curiosity: curiosity.score,
      education: education.score,
      ending: ending.score,
      duration: durationScore,
    },
    reasons,
  };
}