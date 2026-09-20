/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Clonable, defaultContainer } from '@nlpjs-neo/core';

import nlp from 'compromise';
import dates from 'compromise-dates';

// `compromise` 14 folded the numbers plugin into core, so `dates` is the only
// plugin left to register.
nlp.extend(dates);

/**
 * Whether a number match is written as an ordinal. `compromise` tags the terms
 * of `second` or `2nd` as `Ordinal`, which is cheaper to read than parsing the
 * text a second time, as the `compromise-numbers` plugin required.
 */
function isOrdinal(data): boolean {
  return (data.terms || []).some((term) =>
    (term.tags || []).includes('Ordinal')
  );
}

/**
 * Formats a number the way an ordinal resolution reported it before
 * `compromise` 14: 2 becomes `2nd`, 11 becomes `11th`.
 */
function toOrdinalString(value: number): string {
  const teens = Math.abs(value) % 100;
  if (teens >= 11 && teens <= 13) {
    return `${value}th`;
  }
  switch (Math.abs(value) % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

const cultures = {
  bn: 'bn_BD',
  el: 'el_GR',
  en: 'en_US',
  hi: 'hi_IN',
  fa: 'fa_IR',
  gl: 'gl_ES',
  pt: 'pt_BR',
  sv: 'sv_SE',
  tl: 'tl_PH',
  ja: 'ja_JP',
  ar: 'ar_AE',
  hy: 'hy_AM',
  eu: 'eu_ES',
  ca: 'ca_ES',
  cs: 'cs_CZ',
  da: 'da_DK',
  ga: 'ga_IE',
  ta: 'ta_IN',
  uk: 'uk_UA',
  zh: 'zh_CN',
  no: 'nb_NO',
};

class BuiltinCompromise extends Clonable {
  declare settings: any;

  constructor(settings: any = {}, container = defaultContainer) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = `builtin-compromise`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
  }

  registerDefault() {
    this.container.registerConfiguration(this.settings.tag, {}, false);
  }

  async findBuiltinEntities(utterance, _locale?) {
    function getDomainFromUrl(url) {
      // oxlint-disable-next-line
      const matches = url.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
      return matches && matches[1];
    }

    try {
      const edges: any[] = [];
      // `compromise-dates` adds `dates()` at runtime through `nlp.extend`,
      // which its types do not declare on the document.
      const extractor: any = nlp(utterance);
      const extractions = {
        hashtag: [extractor.hashTags()],
        person: [extractor.people()],
        place: [extractor.places()],
        organization: [extractor.organizations()],

        email: [
          extractor.emails(),
          function (result, data) {
            result.resolution = { value: data.text.replace(',', '', 'g') };
            return result;
          },
        ],
        phonenumber: [
          extractor.phoneNumbers(),
          function (result, data) {
            result.resolution = { value: data.text.replace(/[^0-9]/g, '') };
            return result;
          },
        ],
        date: [
          extractor.dates(),
          function (result, data) {
            // `compromise-dates` 3 reports the range under `dates`, where
            // version 1 used `date`.
            result.resolution.value = data?.dates?.start ?? '';
            return result;
          },
        ],
        url: [
          extractor.urls(),
          function (result, data) {
            result.resolution.domain = getDomainFromUrl(data.text);
            return result;
          },
        ],
        number: [
          extractor.numbers(),
          function (result, data) {
            // In `compromise` 14 the value lives under `number.num`, and the
            // cardinal and ordinal spellings the `compromise-numbers` plugin
            // used to supply are gone. Whether a match is an ordinal is now
            // read from the tags its terms carry.
            const value = data.number?.num;
            if (isOrdinal(data)) {
              result.resolution = {
                strValue: data.text,
                value: toOrdinalString(value),
              };
              result.entity = 'ordinal';
            } else {
              result.resolution = {
                strValue: `${value}`,
                value,
                subtype: value % 1 === 0 ? 'integer' : 'float',
              };
              result.entity = 'number';
            }
            return result;
          },
        ],
      };

      Object.keys(extractions).forEach((extractionKey) => {
        const extracted = extractions[extractionKey][0].json({ offset: true });

        extracted.forEach((data, eKey) => {
          if (data && data.text && data.offset) {
            const text = data.text.replace(',', '', 'g');
            let result: any = {
              start: data.offset.start,
              end: data.offset.start + text.length - 1,
              len: text.length,
              accuracy: 0.95,
              sourceText: text,
              utteranceText: text,
            };
            if (extracted.length > 1) {
              result.entity = `${extractionKey}_${eKey}`;
            } else {
              result.entity = extractionKey;
            }
            result.resolution = {
              value: text,
            };
            if (
              extractions[extractionKey].length > 1 &&
              extractions[extractionKey][1]
            ) {
              result = extractions[extractionKey][1](result, data);
            }
            edges.push(result);
          }
          return null;
        });
        return null;
      });
      return { edges };
    } catch (ex) {
      this.logger.error(ex);
      return { edges: [] };
    }
  }

  async extract(srcInput) {
    const input = srcInput;
    const entities: any = await this.findBuiltinEntities(
      input.text || input.utterance,
      input.locale
    );
    if (!input.edges) {
      input.edges = [];
    }
    if (!input.sourceEntities) {
      input.sourceEntities = [];
    }
    if (entities.edges) {
      for (let i = 0; i < entities.edges.length; i += 1) {
        input.edges.push(entities.edges[i]);
      }
    }
    if (entities.source) {
      for (let i = 0; i < entities.source.length; i += 1) {
        input.sourceEntities.push(entities.source[i]);
      }
    }
    return input;
  }

  run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor = this.container.get(`extract-builtin-${locale}`) || this;
    return extractor.extract(input);
  }

  static getCulture(locale?) {
    const result = cultures[locale];
    if (result) {
      return result;
    }
    return locale ? `${locale}_${locale.toUpperCase()}` : 'en_US';
  }
}

export default BuiltinCompromise;
