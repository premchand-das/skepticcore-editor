import { createLogger } from "../core/logger.js";
import { TranscriptNormalizer } from "../analysis/TranscriptNormalizer.js";
import { CandidateGenerator } from "../reasoning/CandidateGenerator.js";
import { CompositeScore } from "../scoring/CompositeScore.js";
import { HookScore } from "../scoring/HookScore.js";
import { EducationScore } from "../scoring/EducationScore.js";
import { RetentionScore } from "../scoring/RetentionScore.js";
import { ShareabilityScore } from "../scoring/ShareabilityScore.js";

const logger = createLogger("AIDirector");

export class AIDirector {
  constructor(options = {}) {
    this.normalizer = new TranscriptNormalizer();
    this.candidateGenerator = new CandidateGenerator(options.candidateOptions);

    this.hookScore = new HookScore();
    this.educationScore = new EducationScore();
    this.retentionScore = new RetentionScore();
    this.shareabilityScore = new ShareabilityScore();
    this.compositeScore = new CompositeScore();
  }

  scoreCandidate(candidate) {
    const hook = this.hookScore.calculate(candidate);
    const education = this.educationScore.calculate(candidate);
    const retention = this.retentionScore.calculate(candidate);
    const shareability = this.shareabilityScore.calculate(candidate);

    const scoredCandidate = {
      ...candidate,
      scores: {
        hookScore: hook.score,
        educationScore: education.score,
        retentionScore: retention.score,
        emotionScore: 0,
        shareabilityScore: shareability.score,
      },
      reasoning: [
        ...hook.reasons,
        ...education.reasons,
        ...retention.reasons,
        ...shareability.reasons,
      ],
    };

    return {
      ...scoredCandidate,
      viralScore: this.compositeScore.calculate(scoredCandidate),
    };
  }

  async analyze({ transcript, limit = 5 }) {
    logger.info("Starting AI Director analysis");

    const segments = this.normalizer.normalize(transcript);

    logger.info(`Normalized ${segments.length} transcript segments`);

    const candidates = this.candidateGenerator.generate(segments);

    logger.info(`Generated ${candidates.length} candidate clips`);

    const ranked = candidates
      .map((candidate) => this.scoreCandidate(candidate))
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, limit);

    logger.info(`Selected top ${ranked.length} clips`);

    return {
      version: "ai-director-v1",
      totalSegments: segments.length,
      totalCandidates: candidates.length,
      clips: ranked,
    };
  }
}