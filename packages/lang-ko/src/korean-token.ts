import type { KoreanPosValue } from './korean-pos.js';

/** One token of a chunked utterance, with where in the input it came from. */
class KoreanToken {
  declare length: number;
  declare offset: number;
  declare pos: KoreanPosValue;
  /** Dictionary root of `text`, when the dictionary knows one. */
  declare stem: string | undefined;
  declare text: string;
  /** `true` when no dictionary entry matched the token. */
  declare unknown: boolean;

  constructor(
    text: string,
    pos: KoreanPosValue,
    offset: number,
    length: number,
    stem?: string,
    unknown = false
  ) {
    this.text = text;
    this.pos = pos;
    this.offset = offset;
    this.length = length;
    this.stem = stem;
    this.unknown = unknown;
  }

  equals(other: KoreanToken): boolean {
    return (
      this.text === other.text &&
      this.pos === other.pos &&
      this.offset === other.offset &&
      this.length === other.length &&
      this.stem === other.stem &&
      this.unknown === other.unknown
    );
  }

  copyWithNewPos(pos: KoreanPosValue): KoreanToken {
    return new KoreanToken(
      this.text,
      pos,
      this.offset,
      this.length,
      undefined,
      this.unknown
    );
  }
}

export { KoreanToken };
