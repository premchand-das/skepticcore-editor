const CURIOSITY_WORDS = [
  "secret",
  "mystery",
  "strange",
  "weird",
  "hidden",
  "unknown",
  "truth",
  "problem",
  "question",
  "discover",
  "understand",
  "explain",
  "reason",
  "evidence",
  "proof",
  "wrong",
  "illusion",
  "reality",
  "consciousness",
  "universe",
  "religion",
  "belief",
  "science",
  "god",
  "mind",
];

export function detectCuriosity(text = "") {
  const lower = String(text || "").toLowerCase();

  let hits = 0;

  for (const word of CURIOSITY_WORDS) {
    if (lower.includes(word)) hits++;
  }

  let score = hits * 5;

  if (/\bwhy\b/i.test(text)) score += 10;
  if (/\bhow\b/i.test(text)) score += 8;
  if (/\bwhat\b/i.test(text)) score += 6;
  if (/\bbecause\b/i.test(text)) score += 5;

  return {
    score: Math.min(score, 35),
    reasons: hits
      ? [`${hits} curiosity signals`]
      : [],
  };
}