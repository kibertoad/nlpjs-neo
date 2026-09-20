import TranslateZh from './translate-zh.js';
import dictionary from './dictionary.js';

class StemmerZh {
  declare container: any;
  declare dictionary: any;
  declare name: any;
  declare translate: any;

  constructor(container) {
    this.container = container;
    this.name = 'stemmer-zh';
    this.translate = new TranslateZh();
    this.dictionary = dictionary;
  }

  definitionContains(arr, text) {
    return arr.filter((x) => x.definition.includes(text)).length > 0;
  }

  parseDefinition(definitions) {
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
    let pinyin = dictionary.getPinyin(definitions[0].simplified);
    if (Array.isArray(pinyin)) {
      pinyin = pinyin.join(' ');
    }
    return pinyin;
  }

  translateToEnglish(token) {
    const definitions = dictionary.search(token);
    if (!definitions || definitions.length === 0) {
      return token;
    }
    return this.parseDefinition(definitions);
  }

  clearText(text) {
    text = text.replace('？', ' ');
    text = text.replace('！', ' ');
    return text.replace(
      new RegExp('.:+-=()"\'!?،,؛;。，？！￥：；《》【】（）', 'g'),
      ' '
    );
  }

  getSegments(text) {
    const presegments = dictionary.segment(text);
    const result: any[] = [];
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

  processText(text) {
    text = this.clearText(text);
    const result: any[] = [];
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

  async stem(text, input) {
    const inputText =
      typeof text === 'string' ? text : input.utterance || input.text;
    return this.processText(inputText);
  }

  async run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    const stemmer = this.container.get(`stemmer-${locale}`) || this;
    input.tokens = await stemmer.stem(
      input.text || input.tokens.join(' '),
      input
    );
    return input;
  }
}

export default StemmerZh;
