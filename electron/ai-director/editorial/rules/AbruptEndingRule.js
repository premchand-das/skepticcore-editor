export class AbruptEndingRule {
  evaluate(candidate) {
    const text = candidate.transcript.trim();

    const weakEndings = [
      "and",
      "but",
      "because",
      "so",
      "or",
      "if",
      "when",
      "then",
      "that",
      "which",
      "to",
    ];

    const lastWord = text
      .split(/\s+/)
      .at(-1)
      ?.toLowerCase()
      .replace(/[^\w]/g, "");

    if (weakEndings.includes(lastWord)) {
      return {
        passed: false,
        warning: `Abrupt ending on weak word: "${lastWord}"`,
      };
    }

    return {
      passed: true,
      warning: null,
    };
  }
}