import { Clonable } from '@nlpjs-neo/core';

class SentimentAnalyzer extends Clonable {
  declare pipelineProcess: any;
  declare settings: any;

  constructor(settings: any = {}, container?) {
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

  registerDefault() {
    this.container.registerConfiguration('sentiment-analyzer', {}, false);
  }

  prepare(locale, text?, settings?, stemmed?) {
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

  async getDictionary(srcInput) {
    const input = srcInput;
    const dictionaries = this.container.get(`sentiment-${input.locale}`);
    let type;
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

  async getTokens(srcInput) {
    const input = srcInput;
    if (!input.tokens && input.sentimentDictionary.type) {
      input.tokens = await this.prepare(
        input.locale,
        input.utterance || input.text,
        input.settings,
        input.sentimentDictionary.stemmed
      );
    }
    return input;
  }

  calculate(srcInput) {
    const input = srcInput;
    if (input.sentimentDictionary.type) {
      const tokens = Array.isArray(input.tokens)
        ? input.tokens
        : Object.keys(input.tokens);
      if (!input.sentimentDictionary.dictionary) {
        input.sentiment = {
          score: 0,
          numWords: tokens.length,
          numHits: 0,
          average: 0,
          type: input.sentimentDictionary.type,
          locale: input.locale,
        };
      } else {
        const { dictionary } = input.sentimentDictionary;
        const { negations } = input.sentimentDictionary;
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
          type: input.sentimentDictionary.type,
          locale: input.locale,
        };
      }
    } else {
      input.sentiment = {
        score: 0,
        numWords: 0,
        numHits: 0,
        average: 0,
        type: input.sentimentDictionary.type,
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

  async defaultPipelineProcess(input) {
    let output = await this.getDictionary(input);
    output = await this.getTokens(output);
    output = await this.calculate(output);
    delete output.sentimentDictionary;
    return output;
  }

  process(srcInput, settings?, _utterance?, _arg3?) {
    const input = srcInput;
    input.settings = input.settings || settings || this.settings;
    if (this.pipelineProcess) {
      return this.runPipeline(input, this.pipelineProcess);
    }
    return this.defaultPipelineProcess(input);
  }
}

export default SentimentAnalyzer;
