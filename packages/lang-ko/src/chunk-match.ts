import type { KoreanPosValue } from './korean-pos.js';

/** Span of the input a chunking pattern matched, and the part of speech it is. */
class ChunkMatch {
  declare end: number;
  declare pos: KoreanPosValue;
  declare start: number;
  declare text: string;

  constructor(start: number, end: number, text: string, pos: KoreanPosValue) {
    this.start = start;
    this.end = end;
    this.text = text;
    this.pos = pos;
  }

  disjoint(other: ChunkMatch): boolean {
    return (
      (other.start < this.start && other.end <= this.start) ||
      (other.start >= this.end && other.end > this.end)
    );
  }
}

export default ChunkMatch;
