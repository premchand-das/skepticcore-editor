export class ShareabilityScore {
  calculate(candidate) {
    const text = candidate.transcript.toLowerCase();

    let score = 35;
    const reasons = [];

    const shareablePatterns = [
      "the truth",
      "the real power",
      "most people",
      "harder to manipulate",
      "certainty",
      "correction",
      "evidence",
      "belief",
      "reality",
      "science",
    ];

    for (const pattern of shareablePatterns) {
      if (text.includes(pattern)) {
        score += 10;
        reasons.push(`Shareable idea: "${pattern}"`);
      }
    }

    if (candidate.duration <= 60) {
      score += 10;
      reasons.push("Easy to consume and share");
    }

    return {
      score: Math.min(score, 100),
      reasons,
    };
  }
}