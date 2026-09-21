import type { Container, PipelineInput, Token } from '@nlpjs-neo/core';
import TranslateZh from './translate-zh.js';
import dictionary from './dictionary.js';
import type { CedictEntry } from './types.js';

/**
 * Stems Chinese by segmenting it with the dictionary and answering the pinyin
 * of each word, so that a classifier trained on one script recognizes the
 * other.
 */
class StemmerZh {
  declare container: Container;
  declare dictionary: typeof dictionary;
  declare name: string;
  declare translate: TranslateZh;

  constructor(container: Container) {
    this.container = container;
    this.name = 'stemmer-zh';
    this.translate = new TranslateZh();
    this.dictionary = dictionary;
  }

  definitionContains(arr: CedictEntry[], text: string): boolean {
    return arr.filter((x) => x.definition.includes(text)).length > 0;
  }

  /** Pinyin of a word, or nothing when it is a particle that carries none. */
  parseDefinition(definitions: CedictEntry[]): string | undefined {
    if (this.definitionContains(definitions, '(possessive particle)')) {
      return undefined;
    }
    if (this.definitionContains(definitions, '(modal particle')) {
      return undefined;
    }
    if (definitions.length === 0) {
      return undefined;
    }
    const firstDefinition = definitions[0].definition;
    if (firstDefinition.includes('you (')) {
      return 'ni3';
    }
    const pinyin = dictionary.getPinyin(definitions[0].simplified);
    return Array.isArray(pinyin) ? pinyin.join(' ') : pinyin;
  }

  translateToEnglish(token: string): string | undefined {
    const definitions = dictionary.search(token);
    if (!definitions || definitions.length === 0) {
      return token;
    }
    return this.parseDefinition(definitions);
  }

  clearText(text: string): string {
    text = text.replace(
      /[.:+\-=()"'!?\u060c,\u061b;\u3002\uff0c\uff1f\uff01\uffe5\uff1a\uff1b\u300a\u300b\u3010\u3011\uff08\uff09]/g,
      ' '
    );
    text = text.replace('？', ' ');
    text = text.replace('！', ' ');
    return text.replace(
      new RegExp('.:+-=()"\'!?،,؛;。，？！￥：；《》【】（）', 'g'),
      ' '
    );
  }

  /** Splits a text into its Chinese words and the runs between them. */
  getSegments(text: string): string[] {
    const presegments = dictionary.segment(text);
    const result: string[] = [];
    let chars = '';
    for (let i = 0; i < presegments.length; i += 1) {
      const segment = presegments[i];
      if (this.translate.isChineseChar(segment)) {
        if (chars) {
          result.push(chars);
          chars = '';
        }
        result.push(segment);
      } else {
        chars += segment;
      }
    }
    if (chars) {
      result.push(chars);
    }
    return result;
  }

  processText(text: string): Token[] {
    text = this.clearText(text);
    const result: string[] = [];
    const segments = this.getSegments(text);
    for (let i = 0; i < segments.length; i += 1) {
      const translated = this.translateToEnglish(segments[i]);
      if (translated) {
        result.push(translated);
      }
    }
    return this.clearText(result.join(' '))
      .toLowerCase()
      .split(' ')
      .filter((x) => x);
  }

  async stem(
    text: Token | Token[] | undefined,
    input?: PipelineInput
  ): Promise<Token[]> {
    const inputText =
      typeof text === 'string' ? text : input.utterance || input.text;
    return this.processText(inputText);
  }

  async run(srcInput: PipelineInput): Promise<PipelineInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const stemmer = this.container.get<StemmerZh>(`stemmer-${locale}`) || this;
    input.tokens = await stemmer.stem(
      input.text || (input.tokens as Token[]).join(' '),
      input
    );
    return input;
  }
}

export default StemmerZh;
