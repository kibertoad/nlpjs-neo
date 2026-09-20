import { Clonable, defaultContainer } from '@nlpjs-neo/core';
import type { Container, Locale } from '@nlpjs-neo/core';
import Recognizers, {
  recognizeNumber,
} from '@microsoft/recognizers-text-suite';
import BuiltinDictionary from './builtin-dictionary.json' with { type: 'json' };
import BuiltinInverse from './builtin-inverse.json' with { type: 'json' };
import type {
  BuiltinEdge,
  BuiltinInput,
  BuiltinMicrosoftSettings,
  BuiltinResolution,
  RecognizerEntity,
} from './types.js';

/** An extractor registered for a locale, which this one defers to. */
interface LocaleExtractor {
  extract(input: BuiltinInput): BuiltinInput | Promise<BuiltinInput>;
}

/** Recognizes one kind of entity in a text, given a culture. */
type Recognizer = (text: string, culture: string) => RecognizerEntity[];

const cultures = {
  bn: 'bn-bd',
  el: 'el-gr',
  en: 'en-us',
  hi: 'hi-in',
  fa: 'fa-ir',
  gl: 'gl-es',
  pt: 'pt-br',
  sv: 'sv-se',
  tl: 'tl-ph',
  ja: 'ja-jp',
  ar: 'ar-ae',
  hy: 'hy-am',
  eu: 'eu-es',
  ca: 'ca-es',
  cs: 'cs-cz',
  da: 'da-dk',
  ga: 'ga-ie',
  ta: 'ta-in',
  uk: 'uk-ua',
  zh: 'zh-cn',
};

/** Locale in the form the recognizers expect, such as `en-us`. */
function getCulture(locale?: Locale): string {
  const result = cultures[locale as keyof typeof cultures];
  if (result) {
    return result;
  }
  return locale ? `${locale}-${locale}` : 'en-us';
}

class BuiltinMicrosoft extends Clonable {
  declare settings: BuiltinMicrosoftSettings;

  constructor(
    settings: BuiltinMicrosoftSettings = {},
    container: Container = defaultContainer
  ) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = `builtin-microsoft`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.settings.builtinAllowList = {};
    for (let i = 0; i < this.settings.allowList.length; i += 1) {
      this.settings.builtinAllowList[this.settings.allowList[i]] = 1;
    }
  }

  registerDefault(): void {
    this.container.registerConfiguration(
      'builtin-microsoft',
      {
        builtins: [
          'Number',
          'Ordinal',
          'Percentage',
          'Age',
          'Currency',
          'Dimension',
          'Temperature',
          'DateTime',
          'PhoneNumber',
          'IpAddress',
          'Boolean',
          'Email',
          'Hashtag',
          'URL',
        ],
        allowList: [
          'age',
          'currency',
          'dimension',
          'temperature',
          'number',
          'numberrange',
          'ordinal',
          'percentage',
          'email',
          'hashtag',
          'ip',
          'mention',
          'phonenumber',
          'url',
          'date',
          'daterange',
          'datetime',
          'datetimealt',
          'time',
          'set',
          'timerange',
          'timezone',
          'boolean',
          'duration',
          'datetimerange',
        ],
      },
      false
    );
  }

  /** The unit of a locale, in that locale; the unit itself when unknown. */
  translate(str: string, locale?: Locale): string {
    const dictionary = BuiltinDictionary as Record<
      string,
      Record<string, string>
    >;
    if (dictionary[locale]) {
      const translation = dictionary[locale][str];
      return translation !== '' ? translation : str;
    }
    return str;
  }

  /** The unit a localized one stands for; the unit itself when unknown. */
  inverseTranslate(str: string, locale?: Locale): string {
    const inverse = BuiltinInverse as Record<string, Record<string, string[]>>;
    if (inverse[locale]) {
      const translation = inverse[locale][str];
      if (translation && translation.length > 0) {
        return translation[0];
      }
    }
    return str;
  }

  calculateResolution(
    entity: RecognizerEntity,
    locale?: Locale
  ): BuiltinResolution | undefined {
    const { resolution } = entity;
    if (['number', 'ordinal', 'percentage'].includes(entity.typeName)) {
      let resValue = resolution.value;
      if (resValue) {
        resValue = resValue.replace(',', '.');
      }
      const value = Number.parseFloat(resValue);
      return {
        strValue: resValue,
        value,
        subtype: value % 1 === 0 ? 'integer' : 'float',
      };
    }
    if (!resolution) {
      return undefined;
    }
    if (
      entity.typeName === 'datetimeV2.date' ||
      entity.typeName === 'datetimeV2.daterange' ||
      entity.typeName === 'datetimeV2.datetimerange'
    ) {
      if (resolution.values) {
        if (resolution.values.length === 1) {
          const resValue = resolution.values[0];
          const result: BuiltinResolution = {
            type: resValue.type,
            timex: resValue.timex,
          };
          if (resValue.value) {
            result.strValue = resValue.value;
            result.date = new Date(resValue.value);
          } else if (resValue.start) {
            result.start = new Date(resValue.start);
            result.end = new Date(resValue.end);
            result.date = new Date(resValue.start);
          }
          return result;
        }
        if (resolution.values.length === 2) {
          const result: BuiltinResolution = {
            type: 'interval',
            timex: resolution.values[0].timex,
          };
          if (resolution.values[0].value) {
            result.strPastValue = resolution.values[0].value;
            result.pastDate = new Date(result.strPastValue);
          }
          if (resolution.values[0].start) {
            result.strPastStartValue = resolution.values[0].start;
            result.pastStartDate = new Date(result.strPastStartValue);
          }
          if (resolution.values[0].end) {
            result.strPastEndValue = resolution.values[0].end;
            result.pastEndDate = new Date(result.strPastEndValue);
          }
          if (resolution.values[1].value) {
            result.strFutureValue = resolution.values[1].value;
            result.futureDate = new Date(result.strFutureValue);
          }
          if (resolution.values[1].start) {
            result.strFutureStartValue = resolution.values[1].start;
            result.futureStartDate = new Date(result.strFutureStartValue);
          }
          if (resolution.values[1].end) {
            result.strFutureEndValue = resolution.values[1].end;
            result.futureEndDate = new Date(result.strFutureEndValue);
          }
          return result;
        }
      }
    }
    if (resolution.unit) {
      const srcUnit = resolution.unit as string;
      resolution.srcUnit = srcUnit;
      resolution.unit = this.translate(srcUnit, locale);
      if (resolution.srcUnit === resolution.unit) {
        resolution.srcUnit = this.inverseTranslate(resolution.srcUnit, locale);
      }
    }
    if (resolution.srcUnit) {
      return {
        strValue: resolution.value,
        value: Number.parseFloat(resolution.value),
        unit: resolution.unit || resolution.srcUnit,
        localeUnit: resolution.srcUnit,
      };
    }
    return resolution;
  }

  /** Drops an edge another one of the same span already accounts for. */
  prereduceEdges(edges: BuiltinEdge[]): BuiltinEdge[] {
    for (let i = 0, l = edges.length; i < l; i += 1) {
      const edge = edges[i];
      if (!edge.discarded) {
        for (let j = i + 1; j < l; j += 1) {
          const other = edges[j];
          if (!other.discarded) {
            if (other.start === edge.start && other.end === edge.end) {
              if (other.entity === 'number' && edge.entity === 'ordinal') {
                other.discarded = true;
              } else if (
                other.entity === edge.entity &&
                other.accuracy === edge.accuracy &&
                ((!edge.resolution && !other.resolution) ||
                  (edge.resolution &&
                    other.resolution &&
                    edge.resolution.subtype === other.resolution.subtype))
              ) {
                other.discarded = true;
              } else if (
                other.entity === 'ordinal' &&
                edge.entity === 'number'
              ) {
                edge.discarded = true;
              } else if (
                other.entity === edge.entity &&
                edge.entity === 'number'
              ) {
                if (
                  (other.sourceText.includes(',') ||
                    other.sourceText.includes('.')) &&
                  parseFloat(other.sourceText.replace(',', '.')) !==
                    parseFloat(other.resolution.strValue.replace(',', '.'))
                ) {
                  other.discarded = true;
                }
                if (
                  (edge.sourceText.includes(',') ||
                    edge.sourceText.includes('.')) &&
                  parseFloat(edge.sourceText.replace(',', '.')) !==
                    parseFloat(edge.resolution.strValue.replace(',', '.'))
                ) {
                  edge.discarded = true;
                }
              }
            }
          }
        }
      }
    }
    const result: BuiltinEdge[] = [];
    for (let i = 0, l = edges.length; i < l; i += 1) {
      if (!edges[i].discarded) {
        result.push(edges[i]);
      }
    }
    return result;
  }

  findBuiltinEntities(
    utterance: string,
    locale?: Locale,
    srcBuiltins?: string[]
  ): { edges: BuiltinEdge[]; source: RecognizerEntity[] } {
    const result: BuiltinEdge[] = [];
    const source: RecognizerEntity[] = [];
    const culture = getCulture(locale);
    const builtins = srcBuiltins || this.settings.builtins;
    // Recognizers are looked up by the name of the builtin, so the suite is
    // read as the map of recognizers it is for that purpose.
    const suite = Recognizers as unknown as Record<string, Recognizer>;
    builtins.forEach((name) => {
      try {
        const recognize = suite[`recognize${name}`];
        const entities =
          name === 'Currency' && locale === 'pt'
            ? recognize(utterance, getCulture('en'))
            : recognize(utterance, culture);
        if (name === 'Number' && locale !== 'en') {
          entities.push(...recognizeNumber(utterance, getCulture('en')));
        }
        for (let i = 0; i < entities.length; i += 1) {
          const entity = entities[i];
          let entityName = entity.typeName;
          const index = entityName.lastIndexOf('.');
          if (index !== -1) {
            entityName = entityName.slice(index + 1);
          }
          entity.entity = entityName;
          source.push(entity);
          if (this.settings.builtinAllowList[entityName]) {
            const text = utterance.slice(entity.start, entity.end + 1);
            const accuracy = 0.95;
            const edge: BuiltinEdge = {
              start: entity.start,
              end: entity.end,
              len: entity.end - entity.start + 1,
              accuracy,
              sourceText: text,
              utteranceText: text,
              entity: entity.entity,
              rawEntity: entity.typeName,
            };
            const resolution = this.calculateResolution(entity, locale);
            if (resolution) {
              edge.resolution = resolution;
            }
            result.push(edge);
          }
        }
      } catch {
        //
      }
    });
    const reducedResult = this.prereduceEdges(result);
    return {
      edges: reducedResult,
      source,
    };
  }

  extract(srcInput: BuiltinInput): BuiltinInput {
    const input = srcInput;
    const entities = this.findBuiltinEntities(
      input.text || input.utterance,
      input.locale,
      input.builtins
    );
    if (!input.edges) {
      input.edges = [];
    }
    if (!input.sourceEntities) {
      input.sourceEntities = [];
    }
    for (let i = 0; i < entities.edges.length; i += 1) {
      input.edges.push(entities.edges[i]);
    }
    for (let i = 0; i < entities.source.length; i += 1) {
      input.sourceEntities.push(entities.source[i]);
    }
    return input;
  }

  run(srcInput: BuiltinInput): BuiltinInput | Promise<BuiltinInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor =
      this.container.get<LocaleExtractor>(`extract-builtin-${locale}`) || this;
    return extractor.extract(input);
  }
}

export default BuiltinMicrosoft;
