export class HookScore {
  calculate(candidate) {
    const text = candidate.transcript.toLowerCase();

    let score = 40;
    const reasons = [];

    const hookPatterns = [
      "most people think",
      "you might think",
      "the truth is",
      "what people don't realize",
      "the problem is",
      "this is why",
      "here's why",
      "the real reason",
      "nobody talks about",
      "the mistake",
    ];

    for (const pattern of hookPatterns) {
      if (text.includes(pattern)) {
        score += 18;
        reasons.push(`Strong hook phrase: "${pattern}"`);
        break;
      }
    }

    if (text.includes("?")) {
      score += 12;
      reasons.push("Contains a question");
    }

    if (candidate.duration >= 25 && candidate.duration <= 55) {
      score += 10;
      reasons.push("Good short-form duration");
    }

    return {
      score: Math.min(score, 100),
      reasons,
    };
  }
}