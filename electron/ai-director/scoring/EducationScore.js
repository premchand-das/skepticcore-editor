export class EducationScore {
  calculate(candidate) {
    const text = candidate.transcript.toLowerCase();

    let score = 35;
    const reasons = [];

    const explanationPatterns = [
      "because",
      "therefore",
      "that means",
      "for example",
      "in other words",
      "this shows",
      "the reason",
      "evidence",
      "method",
      "understand",
    ];

    for (const pattern of explanationPatterns) {
      if (text.includes(pattern)) {
        score += 10;
        reasons.push(`Educational explanation marker: "${pattern}"`);
      }
    }

    const wordCount = candidate.transcript.split(/\s+/).length;

    if (wordCount >= 70) {
      score += 10;
      reasons.push("Enough substance for learning");
    }

    return {
      score: Math.min(score, 100),
      reasons,
    };
  }
}