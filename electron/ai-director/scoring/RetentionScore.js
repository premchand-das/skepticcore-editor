export class RetentionScore {
  calculate(candidate) {
    const text = candidate.transcript.toLowerCase();

    let score = 35;
    const reasons = [];

    if (text.includes("?")) {
      score += 15;
      reasons.push("Question creates curiosity loop");
    }

    const contrastWords = [
      "but",
      "however",
      "instead",
      "actually",
      "yet",
      "although",
    ];

    for (const word of contrastWords) {
      if (text.includes(` ${word} `)) {
        score += 12;
        reasons.push(`Contrast creates retention: "${word}"`);
        break;
      }
    }

    const endingPatterns = [
      "that is why",
      "that's why",
      "that is the point",
      "that is the real",
      "this matters",
      "the result is",
    ];

    for (const pattern of endingPatterns) {
      if (text.includes(pattern)) {
        score += 12;
        reasons.push("Has a satisfying conclusion");
        break;
      }
    }

    return {
      score: Math.min(score, 100),
      reasons,
    };
  }
}