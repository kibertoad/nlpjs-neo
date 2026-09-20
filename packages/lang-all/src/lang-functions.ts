import { Language } from '@nlpjs-neo/language';
import type {
  Locale,
  NormalizerService,
  StemmerService,
  StopwordsService,
  Token,
  TokenizerService,
} from '@nlpjs-neo/core';
import type {
  LanguagePack,
  LanguageServiceConstructor,
  SentimentService,
  Vocabulary,
} from './types.js';
import * as langAr from '@nlpjs-neo/lang-ar';
import * as langBn from '@nlpjs-neo/lang-bn';
import * as langCa from '@nlpjs-neo/lang-ca';
import * as langCs from '@nlpjs-neo/lang-cs';
import * as langDa from '@nlpjs-neo/lang-da';
import * as langDe from '@nlpjs-neo/lang-de';
import * as langEl from '@nlpjs-neo/lang-el';
import * as langEn from '@nlpjs-neo/lang-en';
import * as langEs from '@nlpjs-neo/lang-es';
import * as langEu from '@nlpjs-neo/lang-eu';
import * as langFa from '@nlpjs-neo/lang-fa';
import * as langFi from '@nlpjs-neo/lang-fi';
import * as langFr from '@nlpjs-neo/lang-fr';
import * as langGa from '@nlpjs-neo/lang-ga';
import * as langGl from '@nlpjs-neo/lang-gl';
import * as langHi from '@nlpjs-neo/lang-hi';
import * as langHu from '@nlpjs-neo/lang-hu';
import * as langHy from '@nlpjs-neo/lang-hy';
import * as langId from '@nlpjs-neo/lang-id';
import * as langIt from '@nlpjs-neo/lang-it';
import * as langJa from '@nlpjs-neo/lang-ja';
import * as langKo from '@nlpjs-neo/lang-ko';
import * as langLt from '@nlpjs-neo/lang-lt';
import * as langMs from '@nlpjs-neo/lang-ms';
import * as langNe from '@nlpjs-neo/lang-ne';
import * as langNl from '@nlpjs-neo/lang-nl';
import * as langNo from '@nlpjs-neo/lang-no';
import * as langPl from '@nlpjs-neo/lang-pl';
import * as langPt from '@nlpjs-neo/lang-pt';
import * as langRo from '@nlpjs-neo/lang-ro';
import * as langRu from '@nlpjs-neo/lang-ru';
import * as langSl from '@nlpjs-neo/lang-sl';
import * as langSr from '@nlpjs-neo/lang-sr';
import * as langSv from '@nlpjs-neo/lang-sv';
import * as langTa from '@nlpjs-neo/lang-ta';
import * as langTh from '@nlpjs-neo/lang-th';
import * as langTl from '@nlpjs-neo/lang-tl';
import * as langTr from '@nlpjs-neo/lang-tr';
import * as langUk from '@nlpjs-neo/lang-uk';
import * as langZh from '@nlpjs-neo/lang-zh';

const langs = {
  ar: langAr,
  bn: langBn,
  ca: langCa,
  cs: langCs,
  da: langDa,
  de: langDe,
  el: langEl,
  en: langEn,
  es: langEs,
  eu: langEu,
  fa: langFa,
  fi: langFi,
  fr: langFr,
  ga: langGa,
  gl: langGl,
  hi: langHi,
  hu: langHu,
  hy: langHy,
  id: langId,
  it: langIt,
  ja: langJa,
  ko: langKo,
  lt: langLt,
  ms: langMs,
  ne: langNe,
  nl: langNl,
  no: langNo,
  pl: langPl,
  pt: langPt,
  ro: langRo,
  ru: langRu,
  sl: langSl,
  sr: langSr,
  sv: langSv,
  ta: langTa,
  th: langTh,
  tl: langTl,
  tr: langTr,
  uk: langUk,
  zh: langZh,
};

const language = new Language();
/**
 * Every way of naming a locale -- both its ISO codes and its English name --
 * mapped to the two letter code the packs are keyed by.
 */
const langDict: Record<string, Locale> = {};
const keys = Object.keys(language.languagesAlpha2);

for (let i = 0; i < keys.length; i += 1) {
  const key = keys[i];
  const langData = language.languagesAlpha2[key];
  langDict[key] = key;
  langDict[langData.alpha3] = key;
  langDict[langData.name.toLowerCase()] = key;
}

/** The class of one kind of service for a language, such as `TokenizerEn`. */
function getLangClass(
  inputLanguage: string,
  className: string
): LanguageServiceConstructor | undefined {
  let locale = langDict[inputLanguage.toLowerCase()];
  if (!locale) {
    locale = langDict[inputLanguage.toLowerCase().slice(0, 2)] || 'en';
  }
  const lang = (langs as Record<Locale, LanguagePack>)[locale];
  if (!lang) {
    throw new Error(
      `Language classes not found for language "${inputLanguage}"`
    );
  }
  const localeCapitalized = `${locale.charAt(0).toUpperCase()}${locale.slice(
    1
  )}`;
  return lang[`${className}${localeCapitalized}`] as
    | LanguageServiceConstructor
    | undefined;
}

function getNormalizer(
  inputLanguage: Locale = 'en'
): NormalizerService | undefined {
  const Clazz = getLangClass(inputLanguage, 'Normalizer');
  if (Clazz) {
    return new Clazz() as NormalizerService;
  }
  return undefined;
}

function getTokenizer(
  inputLanguage: Locale = 'en'
): TokenizerService | undefined {
  const Clazz = getLangClass(inputLanguage, 'Tokenizer');
  if (Clazz) {
    return new Clazz() as TokenizerService;
  }
  return undefined;
}

function getStemmer(inputLanguage: Locale = 'en'): StemmerService | undefined {
  const Clazz = getLangClass(inputLanguage, 'Stemmer');
  if (Clazz) {
    return new Clazz() as StemmerService;
  }
  return undefined;
}

function getStopwords(
  inputLanguage: Locale = 'en'
): StopwordsService | undefined {
  const Clazz = getLangClass(inputLanguage, 'Stopwords');
  if (Clazz) {
    return new Clazz() as StopwordsService;
  }
  return undefined;
}

function getSentiment(
  inputLanguage: Locale = 'en'
): SentimentService | undefined {
  const Clazz = getLangClass(inputLanguage, 'Sentiment');
  if (Clazz) {
    return new Clazz() as SentimentService;
  }
  return undefined;
}

function normalize(text: string, locale: Locale = 'en'): string {
  const normalizer = getNormalizer(locale);
  return normalizer.normalize(text);
}

function tokenize(
  text: string,
  locale: Locale = 'en',
  shouldNormalize = false
): Token[] {
  const tokenizer = getTokenizer(locale);
  return tokenizer.tokenize(text, shouldNormalize) as Token[];
}

function stem(text: string | Token[], locale: Locale = 'en'): Token[] {
  const stemmer = getStemmer(locale);
  if (Array.isArray(text)) {
    return stemmer.stem(text) as Token[];
  }
  const normalizer = getNormalizer(locale);
  const tokenizer = getTokenizer(locale);
  return stemmer.stem(
    tokenizer.tokenize(normalizer.normalize(text)) as Token[]
  ) as Token[];
}

function removeStopwords(tokens: Token[], locale: Locale = 'en'): Token[] {
  const stopwords = getStopwords(locale);
  return stopwords.removeStopwords(tokens);
}

/** Builds the vocabulary of a corpus, so `bow` can vectorize a sentence. */
function dict(
  sentences: string[],
  locale: Locale = 'en',
  useStemmer = false
): Vocabulary {
  const freqs: Record<Token, number> = {};
  for (let i = 0; i < sentences.length; i += 1) {
    const current = useStemmer
      ? stem(sentences[i], locale)
      : tokenize(sentences[i], locale).map((x) => x.toLowerCase());
    for (let j = 0; j < current.length; j += 1) {
      freqs[current[j]] = (freqs[current[j]] || 0) + 1;
    }
  }
  const positions: Record<Token, number> = {};
  const words = Object.keys(freqs);
  for (let i = 0; i < words.length; i += 1) {
    positions[words[i]] = i;
  }
  return {
    locale,
    useStemmer,
    freqs,
    positions,
    keys: words,
    length: words.length,
  };
}

/** Turns a sentence into the bag of words vector of a vocabulary. */
function bow(sentence: string, voc: Vocabulary): number[] {
  const current = voc.useStemmer
    ? stem(sentence, voc.locale)
    : tokenize(sentence, voc.locale).map((x) => x.toLowerCase());
  const result = new Array(voc.length).fill(0);
  for (let i = 0; i < current.length; i += 1) {
    const index = voc.positions[current[i]];
    if (index !== undefined) {
      result[index] = 1;
    }
  }
  return result;
}

export {
  langs,
  language,
  langDict,
  getNormalizer,
  getTokenizer,
  getStemmer,
  getStopwords,
  getSentiment,
  normalize,
  tokenize,
  stem,
  removeStopwords,
  dict,
  bow,
};
