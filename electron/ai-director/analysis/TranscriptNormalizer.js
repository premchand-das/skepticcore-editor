import { createTranscriptSegment } from "../core/types.js";

export class TranscriptNormalizer {
  normalize(rawTranscript) {
    if (!Array.isArray(rawTranscript)) {
      throw new Error("Transcript must be an array");
    }

    return rawTranscript
      .filter((item) => item && item.text && item.start != null)
      .map((item, index) =>
        createTranscriptSegment({
          id: `seg_${index + 1}`,
          start: Number(item.start),
          end: Number(item.end ?? item.start + (item.duration || 0)),
          text: String(item.text).trim(),
          speaker: item.speaker || null,
        })
      )
      .filter((seg) => seg.text.length > 0 && seg.end > seg.start);
  }
}