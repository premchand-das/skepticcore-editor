export const ClipStatus = {
  CANDIDATE: "candidate",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const AnalysisSource = {
  RULE: "rule",
  LLM: "llm",
  TRANSCRIPT: "transcript",
  WHISPER: "whisper",
};

export function createTranscriptSegment({
  id,
  start,
  end,
  text,
  speaker = null,
}) {
  return {
    id,
    start,
    end,
    text,
    speaker,
  };
}

export function createCandidateClip({
  id,
  start,
  end,
  transcript,
  topic = null,
}) {
  return {
    id,
    start,
    end,
    duration: end - start,
    transcript,
    topic,
    status: ClipStatus.CANDIDATE,
    scores: {},
    reasoning: [],
    warnings: [],
  };
}