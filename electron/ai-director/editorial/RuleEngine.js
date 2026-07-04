import { DurationRule } from "./rules/DurationRule.js";
import { MinimumContextRule } from "./rules/MinimumContextRule.js";
import { AbruptEndingRule } from "./rules/AbruptEndingRule.js";
import { OneIdeaRule } from "./rules/OneIdeaRule.js";

export class RuleEngine {
  constructor(options = {}) {
    this.rules = [
      new DurationRule(options.duration),
      new MinimumContextRule(options.context),
      new AbruptEndingRule(),
      new OneIdeaRule(),
    ];
  }

  evaluate(candidate) {
    const warnings = [];
    let passed = true;

    for (const rule of this.rules) {
      const result = rule.evaluate(candidate);

      if (!result.passed) {
        passed = false;
        warnings.push(result.warning);
      }
    }

    return {
      passed,
      warnings,
    };
  }
}