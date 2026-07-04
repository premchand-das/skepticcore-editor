export class CompositeScore {
  calculate(candidate) {
    const scores = candidate.scores || {};

    const hook = scores.hookScore ?? 0;
    const education = scores.educationScore ?? 0;
    const retention = scores.retentionScore ?? 0;
    const emotion = scores.emotionScore ?? 0;
    const shareability = scores.shareabilityScore ?? 0;

    const finalScore =
      hook * 0.25 +
      education * 0.25 +
      retention * 0.2 +
      shareability * 0.2 +
      emotion * 0.1;

    return Math.round(finalScore);
  }
}