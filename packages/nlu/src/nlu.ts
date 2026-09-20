import { Clonable, compareWildcars } from '@nlpjs-neo/core';
import { SpellCheck } from '@nlpjs-neo/similarity';

class Nlu extends Clonable {
  declare cache: any;
  declare features: any;
  declare featuresToIntent: any;
  declare intentFeatures: any;
  declare intents: any;
  declare intentsArr: any;
  declare nonefeatureValue: any;
  declare numFeatures: any;
  declare numIntents: any;
  declare pipelinePrepare: any;
  declare pipelineProcess: any;
  declare pipelineTrain: any;
  declare settings: any;
  declare spellCheck: any;

  constructor(settings: any = {}, container?) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    this.applySettings(this.settings, { locale: 'en' });
    if (!this.settings.tag) {
      this.settings.tag = `nlu-${this.settings.locale}`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.applySettings(this, {
      pipelinePrepare: this.getPipeline(`${this.settings.tag}-prepare`),
      pipelineTrain: this.getPipeline(`${this.settings.tag}-train`),
      pipelineProcess: this.getPipeline(`${this.settings.tag}-process`),
    });
    this.spellCheck = new SpellCheck(this.settings);
  }

  registerDefault() {
    this.container.registerConfiguration(
      'nlu-??',
      {
        keepStopwords: true,
        nonefeatureValue: 1,
        nonedeltaMultiplier: 1.2,
        spellCheck: false,
        spellCheckDistance: 1,
        filterZeros: true,
        log: true,
      },
      false
    );
    this.container.registerPipeline(
      'nlu-??-train',
      ['.prepareCorpus', '.addNoneFeature', '.innerTrain'],
      false
    );
  }

  async defaultPipelinePrepare(input) {
    let result;
    if (this.cache) {
      const now = new Date();
      const diff = Math.abs(now.getTime() - this.cache.created) / 3600000;
      if (diff > 1) {
        this.cache.results = {};
        this.cache.created = new Date().getTime();
      }
    }
    if (!this.cache) {
      this.cache = {
        created: new Date().getTime(),
        results: {},
        normalize: this.container.get('normalize'),
        tokenize: this.container.get('tokenize'),
        removeStopwords: this.container.get('removeStopwords'),
        stem: this.container.get('stem'),
        arrToObj: this.container.get('arrToObj'),
      };
    } else if (this.cache.results[input.settings.locale]) {
      result =
        this.cache.results[input.settings.locale][
          input.text || input.utterance
        ];
      if (result) {
        return result;
      }
    }
    let output = input;
    output = this.cache.normalize.run(output);
    output = await this.cache.tokenize.run(output);
    output = this.cache.removeStopwords.run(output);
    output = await this.cache.stem.run(output);
    output = this.cache.arrToObj.run(output);
    result = output.tokens;
    if (!this.cache.results[input.settings.locale]) {
      this.cache.results[input.settings.locale] = {};
    }
    this.cache.results[input.settings.locale][input.text || input.utterance] =
      result;
    return result;
  }

  async defaultPipelineProcess(input) {
    let output = await this.prepare(input);
    output = await this.doSpellCheck(output);
    output = await this.textToFeatures(output);
    output = await this.innerProcess(output);
    output = await this.filterNonActivated(output);
    output = await this.normalizeClassifications(output);
    return output;
  }

  async prepare(text, srcSettings?) {
    const settings = srcSettings || this.settings;
    if (typeof text === 'string') {
      const input = {
        locale: this.settings.locale,
        text,
        settings,
      };
      if (this.pipelinePrepare) {
        return this.runPipeline(input, this.pipelinePrepare);
      }
      return this.defaultPipelinePrepare(input);
    }
    if (typeof text === 'object') {
      if (Array.isArray(text)) {
        const result: any[] = [];
        for (let i = 0; i < text.length; i += 1) {
          result.push(await this.prepare(text[i], settings));
        }
        return result;
      }
      let item = settings.fieldNameSrc
        ? text[settings.fieldNameSrc]
        : text.texts || text.utterances;
      if (!item && typeof item !== 'string') {
        if (typeof text.text === 'string') {
          item = text.text;
        } else if (typeof text.utterance === 'string') {
          item = text.utterance;
        }
      }
      if (item || typeof item === 'string') {
        const result = await this.prepare(item, settings);
        const targetField = settings.fieldNameTgt || 'tokens';
        return { [targetField]: result, ...text };
      }
    }
    throw new Error(
      `Error at nlu.prepare: expected a text but received ${text}`
    );
  }

  async doSpellCheck(input, srcSettings?) {
    const settings = this.applySettings(srcSettings || {}, this.settings);
    let shouldSpellCheck =
      input.settings.spellCheck === undefined
        ? undefined
        : input.settings.spellCheck;
    let spellCheckDistance =
      input.settings.spellCheckDistance === undefined
        ? undefined
        : input.settings.spellCheckDistance;
    if (shouldSpellCheck === undefined) {
      shouldSpellCheck =
        settings.spellCheck === undefined ? undefined : settings.spellCheck;
    }
    if (spellCheckDistance === undefined) {
      spellCheckDistance =
        settings.spellCheckDistance === undefined
          ? 1
          : settings.spellCheckDistance;
    }
    if (shouldSpellCheck) {
      const tokens = this.spellCheck.check(input.tokens, spellCheckDistance);
      input.tokens = tokens;
    }
    return input;
  }

  async prepareCorpus(srcInput) {
    this.features = {};
    this.intents = {};
    this.intentFeatures = {};
    const input = srcInput;
    const { corpus } = input;
    const result: any[] = [];
    for (let i = 0; i < corpus.length; i += 1) {
      const { intent } = corpus[i];
      const item = {
        input: await this.prepare(corpus[i].utterance, input.settings),
        output: { [intent]: 1 },
      };
      const keys = Object.keys(item.input);
      if (!Object.prototype.hasOwnProperty.call(this.intentFeatures, intent)) {
        this.intentFeatures[intent] = {};
      }
      for (let j = 0; j < keys.length; j += 1) {
        this.features[keys[j]] = 1;
        this.intentFeatures[intent][keys[j]] = 1;
      }
      this.intents[intent] = 1;
      result.push(item);
    }
    const keys = Object.keys(this.intentFeatures);
    this.featuresToIntent = {};
    for (let i = 0; i < keys.length; i += 1) {
      const intent = keys[i];
      const features = Object.keys(this.intentFeatures[intent]);
      for (let j = 0; j < features.length; j += 1) {
        const feature = features[j];
        if (
          !Object.prototype.hasOwnProperty.call(this.featuresToIntent, feature)
        ) {
          this.featuresToIntent[feature] = [];
        }
        this.featuresToIntent[feature].push(intent);
      }
    }
    this.spellCheck.setFeatures(this.features);
    this.numFeatures = Object.keys(this.features).length;
    this.numIntents = Object.keys(this.intents).length;
    input.corpus = result;
    return input;
  }

  addNoneFeature(input) {
    const { corpus } = input;
    if (input.settings && input.settings.useNoneFeature) {
      corpus.push({ input: { nonefeature: 1 }, output: { None: 1 } });
    }
    return input;
  }

  convertToArray(srcInput) {
    const input = srcInput;
    const { classifications } = input;
    if (classifications) {
      if (!this.intentsArr) {
        if (this.intents) {
          this.intentsArr = Object.keys(this.intents);
          if (!this.intents.None) {
            this.intentsArr.push('None');
          }
        } else {
          this.intentsArr = Object.keys(classifications);
        }
      }
      const keys = this.intentsArr;
      const result: any[] = [];
      for (let i = 0; i < keys.length; i += 1) {
        const intent = keys[i];
        const score = classifications[intent];
        if (score !== undefined && (score > 0 || !input.settings.filterZeros)) {
          result.push({ intent, score });
        }
      }
      if (!result.length) {
        result.push({ intent: 'None', score: 1 });
      }
      input.classifications = result.sort((a, b) => b.score - a.score);
    }
    return input;
  }

  someSimilar(tokensA, tokensB) {
    for (let i = 0; i < tokensB.length; i += 1) {
      if (tokensA[tokensB[i]]) {
        return true;
      }
    }
    return false;
  }

  matchAllowList(intent, allowList) {
    for (let i = 0; i < allowList.length; i += 1) {
      if (compareWildcars(intent, allowList[i])) {
        return true;
      }
    }
    return false;
  }

  intentIsActivated(intent, tokens, allowList) {
    if (allowList) {
      if (Array.isArray(allowList)) {
        return this.matchAllowList(intent, allowList);
      }
      if (!allowList[intent]) {
        return false;
      }
    }
    const features = this.intentFeatures[intent];
    if (!features) {
      return false;
    }
    const keys = Object.keys(tokens);
    for (let i = 0; i < keys.length; i += 1) {
      if (features[keys[i]]) {
        return true;
      }
    }
    return false;
  }

  filterNonActivated(srcInput) {
    if (this.intentFeatures && srcInput.classifications) {
      const intents = srcInput.classifications.map((x) => x.intent);
      let someModified = false;
      for (let i = 0; i < intents.length; i += 1) {
        const intent = intents[i];
        if (intent !== 'None') {
          if (
            !this.intentIsActivated(
              intent,
              srcInput.tokens,
              srcInput.settings.allowList
            )
          ) {
            srcInput.classifications[i].score = 0;
            someModified = true;
          }
        }
      }
      if (someModified) {
        srcInput.classifications.sort((a, b) => b.score - a.score);
      }
    }
    return srcInput;
  }

  normalizeClassifications(srcInput) {
    const input = srcInput;
    const { classifications } = input;
    if (classifications) {
      let total = 0;
      for (let i = 0; i < classifications.length; i += 1) {
        classifications[i].score **= 2;
        total += classifications[i].score;
      }
      if (total > 0) {
        for (let i = 0; i < classifications.length; i += 1) {
          classifications[i].score /= total;
        }
      }
    } else {
      input.classifications = input.nluAnswer;
    }
    return input;
  }

  textToFeatures(srcInput) {
    const input = srcInput;
    const { tokens } = input;
    const keys = Object.keys(tokens);
    let unknownTokens = 0;
    const features: any = {};
    for (let i = 0; i < keys.length; i += 1) {
      const token = keys[i];
      if (token === 'nonefeature') {
        tokens[token] = this.nonefeatureValue;
      } else if (!this.features || !this.features[token]) {
        unknownTokens += 1;
      } else {
        features[token] = tokens[token];
      }
    }
    let nonedelta =
      input.settings.nonedeltaValue === undefined
        ? this.numIntents / this.numFeatures
        : this.settings.nonedeltaValue;
    let nonevalue = 0;
    for (let i = 0; i < unknownTokens; i += 1) {
      nonevalue += nonedelta;
      nonedelta *= this.settings.nonedeltaMultiplier;
    }
    if (input.settings && input.settings.useNoneFeature && nonevalue) {
      features.nonefeature = nonevalue;
    }
    input.tokens = features;
    return input;
  }

  async innerTrain(_srcInput?) {
    throw new Error('This method should be implemented by child classes');
  }

  innerProcess(_srcInput?): any {
    throw new Error('This method should be implemented by child classes');
  }

  async train(corpus?, settings?) {
    const input = {
      corpus,
      settings: this.applySettings(settings, this.settings),
    };
    return this.runPipeline(input, this.pipelineTrain);
  }

  async getExplanation(input, explanation) {
    if (!explanation) {
      return undefined;
    }
    const normalized = await this.container.get('normalize').run(input);
    const tokenized = await this.container.get('tokenize').run(normalized);
    const { tokens } = tokenized;
    const stemmed = await this.container.get('stem').run(tokenized);
    const stems = stemmed.tokens;
    const result: any[] = [];
    result.push({
      token: '',
      stem: '##bias',
      weight: explanation.bias,
    });
    for (let i = 0; i < tokens.length; i += 1) {
      const stem = stems[i];
      result.push({
        token: tokens[i],
        stem,
        weight: explanation.weights[stem],
      });
    }
    return result;
  }

  async process(utterance, settings?, _arg2?, _arg3?) {
    const input = {
      text: utterance,
      settings: this.applySettings(settings || {}, this.settings),
    };
    let output;
    if (this.pipelineProcess) {
      output = await this.runPipeline(input, this.pipelineProcess);
    } else {
      output = await this.defaultPipelineProcess(input);
    }
    if (Array.isArray(output.classifications)) {
      const explanation = input.settings.returnExplanation
        ? await this.getExplanation(input, output.explanation)
        : undefined;
      return {
        classifications: output.classifications,
        entities: undefined,
        explanation,
      };
    }
    if (output.intents) {
      output.classifications = output.intents;
      delete output.intents;
    }
    return output;
  }

  toJSON() {
    const result = {
      settings: { ...this.settings },
      features: this.features,
      intents: this.intents,
      intentFeatures: this.intentFeatures,
      featuresToIntent: this.featuresToIntent,
    };
    delete result.settings.container;
    return result;
  }

  fromJSON(json) {
    this.applySettings(this.settings, json.settings);
    this.features = json.features || {};
    this.intents = json.intents || {};
    this.intentsArr = Object.keys(json.intents);
    this.featuresToIntent = json.featuresToIntent || {};
    this.intentFeatures = json.intentFeatures || {};
    this.spellCheck.setFeatures(this.features);
    this.numFeatures = Object.keys(this.features).length;
    this.numIntents = Object.keys(this.intents).length;
  }
}

export default Nlu;
