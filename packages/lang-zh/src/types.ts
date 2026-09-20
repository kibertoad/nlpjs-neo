/**
 * Types of the Chinese language pack: the dialects it tells apart, the
 * conversion tables it uses and the tokens its dictionary produces.
 */

/** Which script a text is written in. */
export type ChineseDialect =
  | 'simplified'
  | 'traditional'
  /** Characters that are the same in both. */
  | 'both'
  /** Not Chinese at all. */
  | 'none';

/** A regional variant of traditional Chinese. */
export type ChineseVariant = 'hk' | 'tw' | 'both' | 'none';

/** What a text may be converted to. */
export type ConversionTarget = 'simplified' | 'traditional' | 'hk' | 'tw';

/** A conversion table: what each character or phrase becomes. */
export type ConversionDict = Record<string, string>;

/** A run of a sentence written in one dialect. */
export interface DialectToken {
  text: string;
  start: number;
  end: number;
  length: number;
  dialect?: ChineseDialect;
  variant?: ChineseVariant;
}

/** How much of a sentence each dialect accounts for, and the verdict. */
export interface DialectIdentification {
  tokens: DialectToken[];
  simplifiedCount: number;
  traditionalCount: number;
  hkCount: number;
  twCount: number;
  noneCount: number;
  bothCount: number;
  dialect?: ChineseDialect;
  variant?: ChineseVariant;
}

/** A phrase found in a conversion table, and what it becomes. */
export interface DictionaryMatch {
  source: string;
  target: string;
}

/**
 * One line of the CC-CEDICT dictionary. A word with several senses has one
 * entry per sense, all carrying the same two spellings.
 */
export interface CedictEntry {
  traditional: string;
  simplified: string;
  /** Pinyin with tone numbers, as the dictionary spells it. */
  pinyin?: string;
  /** The English glosses of this sense, slash separated. */
  definition?: string;
}
