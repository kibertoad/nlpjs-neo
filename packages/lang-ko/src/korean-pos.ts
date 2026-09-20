const KoreanPos = {
  Noun: 0,
  Korean: 14,
  Foreign: 15,
  Number: 16,
  KoreanParticle: 17,
  Alpha: 18,
  Punctuation: 19,
  ScreenName: 21,
  Email: 22,
  Space: 25,
};

/** Part of speech a chunk or token was recognized as. */
type KoreanPosValue = (typeof KoreanPos)[keyof typeof KoreanPos];

export { KoreanPos };
export type { KoreanPosValue };
