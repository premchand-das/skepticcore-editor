export class MinimumContextRule {
  constructor(options = {}) {
    this.minWords = options.minWords ?? 45;
  }

  evaluate(candidate) {
    const wordCount = candidate.transcript.split(/\s+/).filter(Boolean).length;

    if (wordCount < this.minWords) {
      return {
        passed: false,
        warning: `Not enough context: ${wordCount} words`,
      };
    }

    return {
      passed: true,
      warning: null,
    };
  }
}