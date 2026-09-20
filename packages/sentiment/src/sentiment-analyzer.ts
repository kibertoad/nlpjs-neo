import { Clonable } from '@nlpjs-neo/core';
import type {
  Container,
  Locale,
  RegisteredPipeline,
  Settings,
  Token,
} from '@nlpjs-neo/core';
import type {
  SentimentDictionaries,
  SentimentDictionaryType,
  SentimentInput,
} from './types.js';

class SentimentAnalyzer extends Clonable {
  declare pipelineProcess: string | string[] | RegisteredPipeline | undefined;
  declare settings: Settings;

  constructor(settings: Settings = {}, container?: Container) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = 'sentiment-analyzer';
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.applySettings(this, {
      pipelinePrepare: this.getPipeline(`${this.settings.tag}-prepare`),
      pipelineProcess: this.getPipeline(`${this.settings.tag}-process`),
    });
  }

  registerDefault(): void {
    this.container.registerConfiguration('sentiment-analyzer', {}, false);
  }

  /** Turns an utterance into the tokens the dictionary is keyed by. */
  prepare(
    locale: Locale,
    text?: string,
    settings?: Settings,
    stemmed?: boolean
  ): Token[] | Promise<Token[]> {
    const pipeline = this.getPipeline(`${this.settings.tag}-prepare`);
    if (pipeline) {
      const input = {
        text,
        locale,
        settings: settings || this.settings,
      };
      return this.runPipeline(input, pipeline);
    }
    if (stemmed) {
      const stemmer =
        this.container.get(`stemmer-${locale}`) ||
        this.container.get(`stemmer-en`);
      if (stemmer) {
        return stemmer.tokenizeAndStem(text);
      }
    }
    const tokenizer =
      this.container.get(`tokenizer-${locale}`) ||
      this.container.get(`tokenizer-en`);
    if (tokenizer) {
      return tokenizer.tokenize(text, true);
    }
    const normalized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return normalized.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  }

  /** Picks the dictionary of the locale, preferring the richest one. */
  async getDictionary(srcInput: SentimentInput): Promise<SentimentInput> {
    const input = srcInput;
    const dictionaries = this.container.get<SentimentDictionaries>(
      `sentiment-${input.locale}`
    );
    let type: SentimentDictionaryType | undefined;
    if (dictionaries) {
      if (dictionaries.senticon) {
        type = 'senticon';
      } else if (dictionaries.pattern) {
        type = 'pattern';
      } else if (dictionaries.afinn) {
        type = 'afinn';
      }
    }
    if (!type) {
      input.sentimentDictionary = {
        type,
        dictionary: undefined,
        negations: [],
        stemmed: false,
      };
      return input;
    }
    input.sentimentDictionary = {
      type,
      dictionary: dictionaries[type],
      negations: dictionaries.negations.words,
      stemmed:
        dictionaries.stemmed === undefined ? false : dictionaries.stemmed,
    };
    return input;
  }

  /**
   * Tokenizes the utterance for the dictionary picked by `getDictionary`.
   * A pipeline that skipped that stage has no dictionary to key tokens by,
   * so there is nothing to prepare.
   */
  async getTokens(srcInput: SentimentInput): Promise<SentimentInput> {
    const input = srcInput;
    const selected = input.sentimentDictionary;
    if (!input.tokens && selected?.type) {
      input.tokens = await this.prepare(
        input.locale,
        input.utterance || input.text,
        input.settings,
        selected.stemmed
      );
    }
    return input;
  }

  /**
   * Scores the tokens against the dictionary picked by `getDictionary`.
   * Without a dictionary, be it an unsupported locale or a pipeline that
   * skipped that stage, the utterance scores as neutral.
   */
  calculate(srcInput: SentimentInput): SentimentInput {
    const input = srcInput;
    const selected = input.sentimentDictionary;
    if (selected?.type) {
      const tokens = Array.isArray(input.tokens)
        ? input.tokens
        : Object.keys(input.tokens);
      if (!selected.dictionary) {
        input.sentiment = {
          score: 0,
          numWords: tokens.length,
          numHits: 0,
          average: 0,
          type: selected.type,
          locale: input.locale,
        };
      } else {
        const { dictionary } = selected;
        const { negations } = selected;
        let score = 0;
        let negator = 1;
        let numHits = 0;
        for (let i = 0; i < tokens.length; i += 1) {
          const token = tokens[i].toLowerCase();
          if (negations.indexOf(token) !== -1) {
            negator = -1;
            numHits += 1;
          } else if (dictionary[token] !== undefined) {
            score += negator * dictionary[token];
            numHits += 1;
          }
        }
        input.sentiment = {
          score,
          numWords: tokens.length,
          numHits,
          average: score / tokens.length,
          type: selected.type,
          locale: input.locale,
        };
      }
    } else {
      input.sentiment = {
        score: 0,
        numWords: 0,
        numHits: 0,
        average: 0,
        type: selected?.type,
        locale: input.locale,
      };
    }
    if (input.sentiment.score > 0) {
      input.sentiment.vote = 'positive';
    } else if (input.sentiment.score < 0) {
      input.sentiment.vote = 'negative';
    } else {
      input.sentiment.vote = 'neutral';
    }
    return input;
  }

  async defaultPipelineProcess(input: SentimentInput): Promise<SentimentInput> {
    let output = await this.getDictionary(input);
    output = await this.getTokens(output);
    output = await this.calculate(output);
    delete output.sentimentDictionary;
    return output;
  }

  /** Scores the sentiment of an utterance and attaches it to the input. */
  process(
    srcInput: SentimentInput,
    settings?: Settings,
    _utterance?: unknown,
    _arg3?: unknown
  ): Promise<SentimentInput> {
    const input = srcInput;
    input.settings = input.settings || settings || this.settings;
    if (this.pipelineProcess) {
      return this.runPipeline(input, this.pipelineProcess);
    }
    return this.defaultPipelineProcess(input);
  }
}

export default SentimentAnalyzer;
