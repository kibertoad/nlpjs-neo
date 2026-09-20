import similarity from './similarity.js';

/** A token, as produced by a tokenizer. */
type Token = string;

/**
 * Known tokens mapped to their weight. A higher weight wins when two
 * candidates are equally close to the token being checked.
 */
type Features = Record<Token, number>;

interface SpellCheckSettings {
  features?: Features;
  /** Tokens shorter than this are never corrected. Defaults to 4. */
  minLength?: number;
  [key: string]: unknown;
}

class SpellCheck {
  declare features: Features;
  /** Features bucketed by their length, so only plausible lengths are scanned. */
  declare featuresByLength: Record<number, Token[]>;
  declare featuresList: Token[];
  declare minLength: number;
  declare settings: SpellCheckSettings;

  constructor(settings?: SpellCheckSettings) {
    this.settings = settings || {};
    this.minLength = this.settings.minLength || 4;
    if (this.settings.features) {
      this.setFeatures(this.settings.features);
    } else {
      this.features = {};
      this.featuresByLength = {};
    }
  }

  setFeatures(features: Features): void {
    this.features = features;
    this.featuresByLength = {};
    this.featuresList = Object.keys(this.features);
    for (let i = 0; i < this.featuresList.length; i += 1) {
      const feature = this.featuresList[i];
      const { length } = feature;
      if (!this.featuresByLength[length]) {
        this.featuresByLength[length] = [];
      }
      this.featuresByLength[length].push(feature);
    }
  }

  /**
   * Returns the known feature closest to the token, or the token itself when
   * no feature is within the given edit distance.
   */
  checkToken(token: Token, distance: number): Token {
    if (this.features[token]) {
      return token;
    }
    if (token.length < this.minLength) {
      return token;
    }
    let best: Token | undefined;
    let distanceBest = Infinity;
    for (
      let i = token.length - distance - 1;
      i < token.length + distance;
      i += 1
    ) {
      const currentFeatures = this.featuresByLength[i + 1];
      if (currentFeatures) {
        for (let j = 0; j < currentFeatures.length; j += 1) {
          const feature = currentFeatures[j];
          const similar = similarity(token, feature);
          if (similar <= distance) {
            if (similar < distanceBest) {
              best = feature;
              distanceBest = similar;
            } else if (similar === distanceBest && best) {
              const la = Math.abs(best.length - token.length);
              const lb = Math.abs(feature.length - token.length);
              if (
                la > lb ||
                (la === lb && this.features[feature] > this.features[best])
              ) {
                best = feature;
                distanceBest = similar;
              }
            }
          }
        }
      }
    }
    return best || token;
  }

  /**
   * Corrects a list of tokens, or the keys of a map of tokens while keeping
   * the values attached to them.
   */
  check(tokens: Token[], distance?: number): Token[];
  check<T>(tokens: Record<Token, T>, distance?: number): Record<Token, T>;
  check<T>(
    tokens: Token[] | Record<Token, T>,
    distance = 1
  ): Token[] | Record<Token, T> {
    if (!Array.isArray(tokens)) {
      const keys = Object.keys(tokens);
      const processed = this.check(keys, distance);
      const obj: Record<Token, T> = {};
      for (let i = 0; i < processed.length; i += 1) {
        obj[processed[i]] = tokens[keys[i]];
      }
      return obj;
    }
    const result: Token[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      result.push(this.checkToken(tokens[i], distance));
    }
    return result;
  }
}

export default SpellCheck;
