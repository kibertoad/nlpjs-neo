import dictionary from './dictionary.json' with { type: 'json' };
import type {
  ChineseDialect,
  ChineseVariant,
  ConversionDict,
  ConversionTarget,
  DialectIdentification,
  DialectToken,
  DictionaryMatch,
} from './types.js';

/**
 * Tells simplified Chinese from traditional -- and Hong Kong from Taiwan --
 * and converts between them.
 *
 * `st`/`ts` convert one character; the `*Phrases` tables convert whole
 * phrases and are applied first, since a phrase may convert differently from
 * its characters. The `*Inverse` tables are the variant tables read backwards.
 */
class TranslateZh {
  /** Characters that are the same in both scripts, as a lookup set. */
  declare both: Record<string, boolean>;
  declare hkPhrases: ConversionDict;
  declare hkPhrasesInverse: ConversionDict;
  declare hkRevPhrases: ConversionDict;
  declare hkVariants: ConversionDict;
  declare hkVariantsInverse: ConversionDict;
  /** Simplified to traditional, one character at a time. */
  declare st: ConversionDict;
  declare stPhrases: ConversionDict;
  /** Traditional to simplified, one character at a time. */
  declare ts: ConversionDict;
  declare tsPhrases: ConversionDict;
  declare twPhrases: ConversionDict;
  declare twPhrasesInverse: ConversionDict;
  declare twRevPhrases: ConversionDict;
  declare twVariants: ConversionDict;
  declare twVariantsInverse: ConversionDict;

  constructor() {
    this.both = {};
    for (let i = 0; i < dictionary.both.length; i += 1) {
      this.both[dictionary.both[i]] = true;
    }
    this.st = {};
    this.ts = {};
    for (let i = 0; i < dictionary.simplified.length; i += 1) {
      this.st[dictionary.simplified[i]] = dictionary.traditional[i];
      this.ts[dictionary.traditional[i]] = dictionary.simplified[i];
    }
    for (let i = 0; i < dictionary.simplified2.length; i += 1) {
      this.ts[dictionary.traditional2[i]] = dictionary.simplified2[i];
    }
    this.stPhrases = dictionary.stphrases;
    this.tsPhrases = dictionary.tsphrases;

    this.hkVariants = dictionary.hkvariants;
    this.hkVariantsInverse = this.inversify(this.hkVariants);
    this.hkPhrases = dictionary.hkphrases;
    this.hkPhrasesInverse = this.inversify(this.hkPhrases);
    this.hkRevPhrases = dictionary.hkrevphrases;

    this.twVariants = dictionary.twvariants;
    this.twVariantsInverse = this.inversify(this.twVariants);
    this.twPhrases = dictionary.twphrases;
    this.twPhrasesInverse = this.inversify(this.twPhrases);
    this.twRevPhrases = dictionary.twrevphrases;
  }

  /** Reads a conversion table backwards. */
  inversify(dict: ConversionDict): ConversionDict {
    const keys = Object.keys(dict);
    const result: ConversionDict = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[dict[keys[i]]] = keys[i];
    }
    return result;
  }

  canGetSlice(
    processedPositions: boolean[],
    start: number,
    currentLength: number
  ): boolean {
    for (let i = 0; i < currentLength; i += 1) {
      if (processedPositions[start + i]) {
        return false;
      }
    }
    return true;
  }

  createToken(
    text: string,
    processedPositions: boolean[],
    start?: number,
    currentLength?: number,
    dialect?: ChineseDialect,
    variant?: ChineseVariant
  ): DialectToken {
    for (let i = 0; i < currentLength; i += 1) {
      processedPositions[start + i] = true;
    }
    return {
      text,
      start,
      end: start + currentLength - 1,
      length: currentLength,
      dialect,
      variant,
    };
  }

  /** Finds the phrases of one length that give a sentence's dialect away. */
  identifyByLength(
    sentence: string,
    processedPositions: boolean[],
    currentLength: number
  ): DialectToken[] {
    const result: DialectToken[] = [];
    for (let i = 0; i < sentence.length - currentLength; i += 1) {
      if (this.canGetSlice(processedPositions, i, currentLength)) {
        const slice = sentence.slice(i, i + currentLength);
        if (this.hkPhrasesInverse[slice] || this.hkRevPhrases[slice]) {
          result.push(
            this.createToken(
              slice,
              processedPositions,
              i,
              currentLength,
              'traditional',
              'hk'
            )
          );
        } else if (this.twPhrasesInverse[slice] || this.twRevPhrases[slice]) {
          result.push(
            this.createToken(
              slice,
              processedPositions,
              i,
              currentLength,
              'traditional',
              'tw'
            )
          );
        } else if (this.stPhrases[slice]) {
          result.push(
            this.createToken(
              slice,
              processedPositions,
              i,
              currentLength,
              'simplified',
              undefined
            )
          );
        } else if (this.tsPhrases[slice]) {
          result.push(
            this.createToken(
              slice,
              processedPositions,
              i,
              currentLength,
              'traditional',
              undefined
            )
          );
        }
      }
    }
    return result;
  }

  isChineseChar(ch: string): boolean {
    const regex =
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]|[\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/g;
    return regex.test(ch);
  }

  /** Classifies the characters no phrase claimed, then joins the runs. */
  identifyByChar(
    sentence: string,
    processedPositions: boolean[]
  ): DialectToken[] {
    const tokens: DialectToken[] = [];
    for (let i = 0; i < sentence.length; i += 1) {
      if (!processedPositions[i]) {
        const char = sentence[i];
        if (this.both[char]) {
          tokens.push(
            this.createToken(char, processedPositions, i, 1, 'both', undefined)
          );
        } else if (this.hkVariantsInverse[char]) {
          tokens.push(
            this.createToken(
              char,
              processedPositions,
              i,
              1,
              'traditional',
              'hk'
            )
          );
        } else if (this.twVariantsInverse[char]) {
          tokens.push(
            this.createToken(
              char,
              processedPositions,
              i,
              1,
              'traditional',
              'tw'
            )
          );
        } else if (this.st[char]) {
          tokens.push(
            this.createToken(
              char,
              processedPositions,
              i,
              1,
              'simplified',
              undefined
            )
          );
        } else if (this.ts[char]) {
          tokens.push(
            this.createToken(
              char,
              processedPositions,
              i,
              1,
              'traditional',
              undefined
            )
          );
        } else {
          tokens.push(
            this.createToken(
              char,
              processedPositions,
              i,
              1,
              this.isChineseChar(char) ? 'both' : 'none',
              undefined
            )
          );
        }
      }
    }
    const result: DialectToken[] = [];
    if (tokens.length > 0) {
      let currentToken = tokens[0];
      for (let i = 1; i < tokens.length; i += 1) {
        const token = tokens[i];
        if (
          token.dialect === currentToken.dialect &&
          token.variant === currentToken.variant
        ) {
          currentToken.text += token.text;
          currentToken.end += 1;
          currentToken.length += 1;
        } else {
          result.push(currentToken);
          currentToken = token;
        }
      }
      result.push(currentToken);
    }
    return result;
  }

  /** Which script a sentence is written in, and which variant of it. */
  identify(sentence: string): DialectIdentification {
    const processedPositions: boolean[] = [];
    for (let i = 0; i < sentence.length; i += 1) {
      processedPositions.push(false);
    }
    const tokens: DialectToken[] = [];
    for (let i = 10; i >= 2; i -= 1) {
      const current = this.identifyByLength(sentence, processedPositions, i);
      for (let j = 0; j < current.length; j += 1) {
        tokens.push(current[j]);
      }
    }
    const byChar = this.identifyByChar(sentence, processedPositions);
    for (let j = 0; j < byChar.length; j += 1) {
      tokens.push(byChar[j]);
    }
    const result: DialectIdentification = {
      tokens,
      simplifiedCount: 0,
      traditionalCount: 0,
      hkCount: 0,
      twCount: 0,
      noneCount: 0,
      bothCount: 0,
    };
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token.dialect === 'none') {
        result.noneCount += token.length;
      } else if (token.dialect === 'both') {
        result.bothCount += token.length;
      } else if (token.dialect === 'traditional') {
        result.traditionalCount += token.length;
        if (token.variant === 'hk') {
          result.hkCount += token.length;
        } else if (token.variant === 'tw') {
          result.twCount += token.length;
        }
      } else if (token.dialect === 'simplified') {
        result.simplifiedCount += token.length;
      }
    }
    if (result.simplifiedCount > result.traditionalCount) {
      result.dialect = 'simplified';
      result.variant = 'none';
    } else if (result.traditionalCount > result.simplifiedCount) {
      result.dialect = 'traditional';
      if (result.hkCount > result.twCount) {
        result.variant = 'hk';
      } else if (result.twCount > result.hkCount) {
        result.variant = 'tw';
      } else if (result.hkCount > 0) {
        result.variant = 'both';
      } else {
        result.variant = 'none';
      }
    } else if (result.bothCount > 0 || result.simplifiedCount > 0) {
      result.dialect = 'both';
      result.variant = 'none';
    } else {
      result.dialect = 'none';
      result.variant = 'none';
    }
    return result;
  }

  /** The longest phrase at a position that any of the tables converts. */
  findIndDict(
    text: string,
    start: number,
    dictionaries: ConversionDict | ConversionDict[]
  ): DictionaryMatch | undefined {
    const tables = Array.isArray(dictionaries) ? dictionaries : [dictionaries];
    for (let i = 10; i > 0; i -= 1) {
      const slice = text.substr(start, i);
      for (let j = 0; j < tables.length; j += 1) {
        const dict = tables[j];
        if (dict[slice]) {
          return {
            source: slice,
            target: dict[slice],
          };
        }
      }
    }
    return undefined;
  }

  translateByDict(
    text: string,
    dict: ConversionDict | ConversionDict[]
  ): string {
    const translated: string[] = [];
    for (let i = 0; i < text.length; i += 1) {
      const token = this.findIndDict(text, i, dict);
      if (token) {
        translated.push(token.target);
        i += token.source.length - 1;
      } else {
        translated.push(text[i]);
      }
    }
    return translated.join('');
  }

  /** Applies each set of tables in turn to what the previous one produced. */
  translateChain(
    text: string,
    dictionaries: (ConversionDict | ConversionDict[])[]
  ): string {
    let result = text;
    for (let i = 0; i < dictionaries.length; i += 1) {
      result = this.translateByDict(result, dictionaries[i]);
    }
    return result;
  }

  simplifiedToTraditional(text: string): string {
    return this.translateChain(text, [[this.stPhrases, this.st]]);
  }

  simplifiedToHongKong(text: string): string {
    return this.translateChain(text, [
      [this.stPhrases, this.st],
      [this.hkPhrases, this.hkVariants],
    ]);
  }

  simplifiedToTaiwan(text: string): string {
    return this.translateChain(text, [
      [this.stPhrases, this.st],
      [this.twPhrases, this.twVariants],
    ]);
  }

  hongKongToSimplified(text: string): string {
    return this.translateChain(text, [
      [this.hkRevPhrases, this.hkVariantsInverse],
      [this.tsPhrases, this.ts],
    ]);
  }

  traditionalToHongKong(text: string): string {
    return this.translateChain(text, [this.hkVariants]);
  }

  hongKongToTraditional(text: string): string {
    return this.translateChain(text, [this.hkVariantsInverse]);
  }

  traditionalToSimplified(text: string): string {
    return this.translateChain(text, [[this.tsPhrases, this.ts]]);
  }

  traditionalToTaiwan(text: string): string {
    return this.translateChain(text, [this.twVariants]);
  }

  taiwanToTraditional(text: string): string {
    return this.translateChain(text, [this.twVariantsInverse]);
  }

  taiwanToSimplified(text: string): string {
    return this.translateChain(text, [
      [this.twRevPhrases, this.twVariantsInverse],
      [this.twPhrasesInverse],
      [this.tsPhrases, this.ts],
    ]);
  }

  simplifiedTo(text: string, target: ConversionTarget): string {
    switch (target) {
      case 'simplified':
        return text;
      case 'traditional':
        return this.simplifiedToTraditional(text);
      case 'hk':
        return this.simplifiedToHongKong(text);
      case 'tw':
        return this.simplifiedToTaiwan(text);
      default:
        throw new Error(
          `Cannot convert to "${target}". Available options are "simplified", "traditional", "hk" and "tw"`
        );
    }
  }

  traditionalTo(text: string, target: ConversionTarget): string {
    switch (target) {
      case 'simplified':
        return this.traditionalToSimplified(text);
      case 'traditional':
        return text;
      case 'hk':
        return this.traditionalToHongKong(text);
      case 'tw':
        return this.traditionalToTaiwan(text);
      default:
        throw new Error(
          `Cannot convert to "${target}". Available options are "simplified", "traditional", "hk" and "tw"`
        );
    }
  }

  hkTo(text: string, target: ConversionTarget): string {
    switch (target) {
      case 'simplified':
        return this.hongKongToSimplified(text);
      case 'traditional':
        return this.hongKongToTraditional(text);
      case 'hk':
        return text;
      case 'tw':
        return this.traditionalToTaiwan(this.hongKongToTraditional(text));
      default:
        throw new Error(
          `Cannot convert to "${target}". Available options are "simplified", "traditional", "hk" and "tw"`
        );
    }
  }

  twTo(text: string, target: ConversionTarget): string {
    switch (target) {
      case 'simplified':
        return this.taiwanToSimplified(text);
      case 'traditional':
        return this.taiwanToTraditional(text);
      case 'hk':
        return this.traditionalToHongKong(this.taiwanToTraditional(text));
      case 'tw':
        return text;
      default:
        throw new Error(
          `Cannot convert to "${target}". Available options are "simplified", "traditional", "hk" and "tw"`
        );
    }
  }

  /**
   * Converts a text between scripts. Called with one script, that script is
   * the target and the source is identified from the text itself.
   */
  translate(
    text: string,
    source: ConversionTarget,
    target?: ConversionTarget
  ): string {
    if (!target) {
      target = source;
      const identification = this.identify(text);
      if (identification.dialect === 'none') {
        return text;
      }
      if (
        identification.dialect === 'simplified' ||
        identification.dialect === 'both'
      ) {
        source = 'simplified';
      } else if (identification.variant === 'hk') {
        source = 'hk';
      } else if (identification.variant === 'tw') {
        source = 'tw';
      } else {
        source = 'traditional';
      }
    }
    switch (source) {
      case 'simplified':
        return this.simplifiedTo(text, target);
      case 'traditional':
        return this.traditionalTo(text, target);
      case 'hk':
        return this.hkTo(text, target);
      case 'tw':
        return this.twTo(text, target);
      default:
        throw new Error(
          `Cannot convert from "${source}". Available options are "simplified", "traditional", "hk" and "tw"`
        );
    }
  }
}

export default TranslateZh;
