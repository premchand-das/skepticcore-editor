import { createCandidateClip } from "../core/types.js";

export class CandidateGenerator {
  constructor(options = {}) {
    this.minDuration = options.minDuration ?? 25;
    this.maxDuration = options.maxDuration ?? 75;
    this.stepSize = options.stepSize ?? 3;
  }

  generate(segments) {
    const candidates = [];

    for (let i = 0; i < segments.length; i += this.stepSize) {
      let text = "";
      let start = segments[i].start;
      let end = segments[i].end;

      for (let j = i; j < segments.length; j++) {
        text += `${segments[j].text} `;
        end = segments[j].end;

        const duration = end - start;

        if (duration >= this.minDuration && duration <= this.maxDuration) {
          candidates.push(
            createCandidateClip({
              id: `clip_${candidates.length + 1}`,
              start,
              end,
              transcript: text.trim(),
            })
          );
        }

        if (duration > this.maxDuration) break;
      }
    }

    return candidates;
  }
}