import {
  BaseStemmer,
  Tokenizer,
  defaultContainer,
  containerBootstrap,
} from '@nlpjs-neo/core-loader';
import type { ContainerHolder, Locale } from '@nlpjs-neo/core-loader';
import * as langAll from '@nlpjs-neo/lang-all';

/**
 * Every export of `lang-all`, looked up by the name a locale builds, so a
 * stemmer or a tokenizer can be resolved from a locale alone.
 */
const LangAll = { ...langAll } as Record<string, unknown>;

const cultures = {
  ar: 'ar-ae', // Arabic
  bn: 'bn-bd', // Bengali
  ca: 'ca-es', // Catalan
  cs: 'cs-cz', // Czech
  da: 'da-dk', // Danish
  el: 'el-gr', // Greek
  en: 'en-us', // English
  eu: 'eu-es', // Basque
  fa: 'fa-ir', // Farsi
  ga: 'ga-ie', // Irish
  gl: 'gl-es', // Galician
  hi: 'hi-in', // Hindi
  hy: 'hy-am', // Armenian
  ja: 'ja-jp', // Japanese
  ko: 'ko-kr', // Korean
  pl: 'pl-pl', // Polish
  lt: 'lt-lt', // Lithuanian
  ne: 'ne-ne', // Nepali
  pt: 'pt-br', // Portuguese
  sr: 'sr-rs', // Serbian
  sv: 'sv-se', // Swedish
  ta: 'ta-in', // Tamil
  tl: 'tl-ph', // Tagalog
  uk: 'uk-ua', // Ukraine
  zh: 'zh-cn', // Chinese
  id: 'id-id', // Indonesian,
  ms: 'id-id', // Malay
};

class NlpUtil {
  /** Stemmers built per locale, so one locale is only built once. */
  declare static autoStemmers: Record<Locale, BaseStemmer>;
  /** Tokenizers built per locale, so one locale is only built once. */
  declare static tokenizers: Record<Locale, Tokenizer>;
  /** Locales that use the alternative classifier rather than the default. */
  declare static useAlternative: Record<Locale, boolean>;
  declare static useAutoStemmer: boolean;
  /** Whether a locale trains the artificial `None` feature. */
  declare static useNoneFeature: Record<Locale, boolean>;

  /**
   * Given a locale, get the 2 character one.
   * @param {String} locale Locale of the language.
   * @returns {String} Locale in 2 character length.
   */
  static getTruncatedLocale(locale?: Locale): Locale | undefined {
    return locale ? locale.substr(0, 2).toLowerCase() : undefined;
  }

  static getStemmer(locale?: Locale): BaseStemmer {
    if (!locale) {
      return new BaseStemmer();
    }
    const name = `Stemmer${locale.slice(0, 1).toUpperCase()}${locale.slice(1)}`;
    const Stemmer = LangAll[name] as
      | (new (container?: ContainerHolder) => BaseStemmer)
      | undefined;
    return Stemmer ? new Stemmer() : new BaseStemmer();
  }

  static getTokenizer(locale?: Locale): Tokenizer {
    if (!locale) {
      return new Tokenizer();
    }
    const name = `Tokenizer${locale.slice(0, 1).toUpperCase()}${locale.slice(
      1
    )}`;
    const TokenizerClass = LangAll[name] as
      | (new (
          container?: ContainerHolder,
          shouldTokenize?: boolean
        ) => Tokenizer)
      | undefined;
    return TokenizerClass
      ? new TokenizerClass(undefined, true)
      : new Tokenizer(undefined, true);
  }

  /** Culture of a locale, such as `en-us`; `<locale>-<locale>` when unknown. */
  static getCulture(locale?: Locale): string {
    if (!locale) {
      return 'en-us';
    }
    return cultures[locale as keyof typeof cultures] || `${locale}-${locale}`;
  }
}

NlpUtil.useAutoStemmer = true;
NlpUtil.autoStemmers = {};

NlpUtil.useAlternative = {};

NlpUtil.useNoneFeature = {
  bn: false,
  el: true,
  en: true,
  hi: false,
  fa: false,
  fr: true,
  ru: true,
  es: true,
  gl: true,
  it: true,
  nl: true,
  no: true,
  pt: true,
  pl: true,
  sv: true,
  tl: true,
  id: true,
  ja: false,
  ar: false,
  hy: false,
  eu: true,
  ca: true,
  cs: true,
  da: true,
  fi: true,
  de: true,
  hu: true,
  ga: true,
  ro: true,
  sl: true,
  ta: false,
  th: false,
  tr: true,
  zh: false,
};

NlpUtil.tokenizers = {};

containerBootstrap({}, true, defaultContainer);
defaultContainer.use(
  LangAll.LangAll as Parameters<typeof defaultContainer.use>[0]
);

export default NlpUtil;
