const HOOK_PATTERNS = [
  /\bnobody\b/i,
  /\bmost people\b/i,
  /\bthe problem\b/i,
  /\bwhat if\b/i,
  /\bwhy\b/i,
  /\bhow\b/i,
  /\bbut\b/i,
  /\bhowever\b/i,
  /\bactually\b/i,
  /\bthe truth\b/i,
  /\bthis is why\b/i,
  /\bthis means\b/i,
  /\bthe strange thing\b/i,
  /\bthe important thing\b/i,
  /\bpeople don't understand\b/i,
  /\byou have to understand\b/i,
];

export function detectHook(text = "") {
  const clean = String(text || "");
  const matches = HOOK_PATTERNS.filter((pattern) => pattern.test(clean));

  let score = matches.length * 8;

  if (clean.includes("?")) score += 12;
  if (clean.length >= 120 && clean.length <= 700) score += 8;
  if (/^\s*(but|however|so|now|why|how|what)\b/i.test(clean)) score += 10;

  return {
    score: Math.min(score, 40),
    reasons: matches.length
      ? ["Strong hook language"]
      : score > 0
        ? ["Possible hook"]
        : [],
  };
}