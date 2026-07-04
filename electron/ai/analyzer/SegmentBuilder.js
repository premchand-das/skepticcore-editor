import { secondsToTime } from "../../services/transcript.js";

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

export function buildCandidateSegments(segments, options = {}) {
  const targetDuration = Number(options.targetDuration || 45);
  const minDuration = Math.max(18, targetDuration - 18);
  const maxDuration = targetDuration + 25;

  const candidates = [];

  for (let i = 0; i < segments.length; i++) {
    const start = Math.max(0, segments[i].start - 1);
    let end = segments[i].end;
    let text = cleanText(segments[i].text);

    let j = i + 1;

    while (j < segments.length && end - start < targetDuration) {
      end = segments[j].end;
      text += ` ${cleanText(segments[j].text)}`;
      j++;
    }

    text = cleanText(text);
    const duration = end - start;

    if (duration >= minDuration && duration <= maxDuration && text.length > 90) {
      candidates.push({
        start,
        end: end + 0.6,
        duration,
        text,
        sourceIndex: i,
      });
    }

    i = Math.max(i, j - 3);
  }

  return candidates.map((candidate, index) => ({
    id: String(index + 1).padStart(3, "0"),
    start: secondsToTime(candidate.start),
    end: secondsToTime(candidate.end),
    startSeconds: candidate.start,
    endSeconds: candidate.end,
    duration: candidate.duration,
    text: candidate.text,
  }));
}