import { BaseStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder, PipelineInput, Token } from '@nlpjs-neo/core';
import { tokenize, stemWord } from './korean-tokenizer.js';
import { initDicts, dictionary } from './korean-dictionary.js';
import TokenizerKo from './tokenizer-ko.js';
import NormalizerKo from './normalizer-ko.js';

const preendings = [
  '하고있는',
  '합니까',
  '습니다',
  '자에게',
  '머에게',
  '밍하는',
  '에게',
  '자에',
  '자의',
  '하고',
  '하는',
  '자는',
  '자가',
  '습니',
  '읍시',
  '는다',
  '으냐',
  'ᆻ다',
  '하는',
  'ᆻ',
  '처',
  '다',
  '요',
  '까',
  '니',
  '시',
  '를',
  '는',
  '에',
  '을',
  '이',
  '의',
  '를',
  '에',
  '는',
  '밍',
];

class StemmerKo extends BaseStemmer {
  /**
   * Korean is stemmed through its own tokenizer and normalizer rather than
   * through the ones the container resolves, so both are held concretely.
   */
  declare koTokenizer: TokenizerKo;
  declare normalizer: NormalizerKo;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ko';
    this.koTokenizer = new TokenizerKo();
    this.tokenizer = this.koTokenizer;
    this.normalizer = new NormalizerKo();
  }

  isHangulChar(ch: string): boolean {
    const regex =
      /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g;
    return regex.test(ch);
  }

  normalize(text: string, _input?: PipelineInput): string {
    return (
      text
        // .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/까?/g, '')
        .toLowerCase()
    );
  }

  tokenize(text: string): Token[] {
    const tokens = text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
    const result: Token[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      let word = token[0];
      let isHangul = this.isHangulChar(token[0]);
      for (let j = 1; j < token.length; j += 1) {
        const char = token[j];
        const newIsHangul = this.isHangulChar(char);
        if (newIsHangul !== isHangul) {
          result.push(word);
          word = char;
          isHangul = newIsHangul;
        } else {
          word += char;
        }
      }
      result.push(word);
    }
    return result;
  }

  prestem(word: string): string {
    for (let i = 0; i < preendings.length; i += 1) {
      if (word.endsWith(preendings[i])) {
        return word.slice(0, -preendings[i].length);
      }
    }
    if (word.endsWith('습니다')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('세요')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('으러')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('러')) {
      return word.slice(0, -1);
    }
    if (word.endsWith('고')) {
      return word.slice(0, -1);
    }
    if (word.endsWith('네')) {
      return word.slice(0, -1);
    }
    if (word.endsWith('다')) {
      return word.slice(0, -1);
    }
    if (word.endsWith('자')) {
      return word.slice(0, -1);
    }
    return word;
  }

  innerStem(): void {
    initDicts();
    const word = this.getCurrent();
    const token = stemWord(this.prestem(word.trim()));
    const value = dictionary[token];
    this.setCurrent(value && value.root ? value.root : token);
  }

  async stem(
    text: Token | Token[] | undefined,
    input?: PipelineInput
  ): Promise<Token[]> {
    initDicts();
    const inputText =
      typeof text === 'string' ? text : input.utterance || input.text;
    const newText = this.koTokenizer
      .tokenize(this.normalizer.normalize(inputText))
      .join(' ');
    const tokens = tokenize(this.normalizer.normalize(newText))
      .map((x) => stemWord(this.prestem(x.trim())))
      .filter((x) => x);
    const result: Token[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const value = dictionary[tokens[i]];
      if (value && value.root) {
        result.push(value.root);
      } else {
        result.push(tokens[i]);
      }
    }
    return result;
  }

  async run(srcInput: PipelineInput): Promise<PipelineInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const stemmer = this.container.get<StemmerKo>(`stemmer-${locale}`) || this;
    input.tokens = await stemmer.stem(
      input.text || (input.tokens as Token[]).join(' '),
      input
    );
    return input;
  }

  tokenizeAndStem(text: string): Token[] {
    initDicts();
    const newText = this.tokenize(this.normalize(text)).join(' ');
    const tokens = tokenize(this.normalize(newText))
      .map((x) => stemWord(this.prestem(x.trim())))
      .filter((x) => x);
    const result: Token[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const value = dictionary[tokens[i]];
      if (value && value.root) {
        result.push(value.root);
      } else {
        result.push(tokens[i]);
      }
    }
    return result;
  }
}

export default StemmerKo;
