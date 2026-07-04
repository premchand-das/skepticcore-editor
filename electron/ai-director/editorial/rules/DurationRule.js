export class DurationRule {
  constructor(options = {}) {
    this.minDuration = options.minDuration ?? 25;
    this.maxDuration = options.maxDuration ?? 75;
  }

  evaluate(candidate) {
    if (candidate.duration < this.minDuration) {
      return {
        passed: false,
        warning: `Too short: ${candidate.duration.toFixed(1)}s`,
      };
    }

    if (candidate.duration > this.maxDuration) {
      return {
        passed: false,
        warning: `Too long: ${candidate.duration.toFixed(1)}s`,
      };
    }

    return {
      passed: true,
      warning: null,
    };
  }
}