export class OneIdeaRule {
  evaluate(candidate) {
    const text = candidate.transcript.toLowerCase();

    const topicShiftMarkers = [
      "another thing",
      "separate issue",
      "moving on",
      "next question",
      "on the other hand",
      "different topic",
    ];

    for (const marker of topicShiftMarkers) {
      if (text.includes(marker)) {
        return {
          passed: false,
          warning: `Possible topic shift: "${marker}"`,
        };
      }
    }

    return {
      passed: true,
      warning: null,
    };
  }
}