import { Clonable, compareWildcars } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Locale,
  RegisteredPipeline,
  Token,
  TokenMap,
} from '@nlpjs-neo/core';
import { SpellCheck } from '@nlpjs-neo/similarity';
import type {
  AllowList,
  Classification,
  CorpusEntry,
  ExplanationEntry,
  FeatureSet,
  FeaturesToIntent,
  Intent,
  IntentFeatures,
  IntentSet,
  NeuralExplanation,
  NluInput,
  NluJson,
  NluResult,
  NluSettings,
  PipelineStage,
  PreparedCorpusEntry,
  SyncPipelineStage,
} from './types.js';

/**
 * Pipeline stages the default prepare path resolves once and keeps, together
 * with the tokens it has already produced per locale and utterance.
 */
interface PrepareCache {
  created: number;
  results: Record<Locale, Record<string, TokenMap>>;
  normalize: SyncPipelineStage;
  tokenize: PipelineStage;
  removeStopwords: SyncPipelineStage;
  stem: PipelineStage;
  arrToObj: SyncPipelineStage;
}

class Nlu extends Clonable {
  /** Prepare stages and their memoized results; built on first use. */
  declare cache: PrepareCache | undefined;
  declare features: FeatureSet;
  declare featuresToIntent: FeaturesToIntent;
  declare intentFeatures: IntentFeatures;
  declare intents: IntentSet;
  /** Known intents in answer order, `None` last; rebuilt after training. */
  declare intentsArr: Intent[] | undefined;
  declare nonefeatureValue: number;
  declare numFeatures: number;
  declare numIntents: number;
  declare pipelinePrepare: RegisteredPipeline | undefined;
  declare pipelineProcess: RegisteredPipeline | undefined;
  declare pipelineTrain: RegisteredPipeline | undefined;
  declare settings: NluSettings;
  declare spellCheck: SpellCheck;

  constructor(settings: NluSettings = {}, container?: ContainerHolder) {
    super(
      {
        settings: {},
        container:
          settings.container ||
          (container &&
            ((container as { container?: Container }).container ||
              (container as Container))),
      },
      container as Container
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

  registerDefault(): void {
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

  async defaultPipelinePrepare(input: NluInput): Promise<TokenMap> {
    let result: TokenMap | undefined;
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
    result = output.tokens as TokenMap;
    if (!this.cache.results[input.settings.locale]) {
      this.cache.results[input.settings.locale] = {};
    }
    this.cache.results[input.settings.locale][input.text || input.utterance] =
      result;
    return result;
  }

  async defaultPipelineProcess(input: NluInput): Promise<NluInput> {
    let output = (await this.prepare(input)) as NluInput;
    output = await this.doSpellCheck(output);
    output = await this.textToFeatures(output);
    output = await this.innerProcess(output);
    output = await this.filterNonActivated(output);
    output = await this.normalizeClassifications(output);
    return output;
  }

  /**
   * Turns a text, a list of them or an object carrying one into the features
   * a classifier is trained and queried with.
   */
  async prepare(
    text: unknown,
    srcSettings?: NluSettings
  ): Promise<TokenMap | TokenMap[] | NluInput> {
    const settings = srcSettings || this.settings;
    if (typeof text === 'string') {
      const input: NluInput = {
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
        const result: TokenMap[] = [];
        for (let i = 0; i < text.length; i += 1) {
          result.push((await this.prepare(text[i], settings)) as TokenMap);
        }
        return result;
      }
      const source = text as NluInput;
      let item = settings.fieldNameSrc
        ? source[settings.fieldNameSrc]
        : source.texts || source.utterances;
      if (!item && typeof item !== 'string') {
        if (typeof source.text === 'string') {
          item = source.text;
        } else if (typeof source.utterance === 'string') {
          item = source.utterance;
        }
      }
      if (item || typeof item === 'string') {
        const result = await this.prepare(item, settings);
        const targetField = settings.fieldNameTgt || 'tokens';
        return { [targetField]: result, ...source };
      }
    }
    throw new Error(
      `Error at nlu.prepare: expected a text but received ${text}`
    );
  }

  async doSpellCheck(
    input: NluInput,
    srcSettings?: NluSettings
  ): Promise<NluInput> {
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
      const tokens = this.spellCheck.check(
        input.tokens as TokenMap,
        spellCheckDistance
      );
      input.tokens = tokens;
    }
    return input;
  }

  async prepareCorpus(srcInput: NluInput): Promise<NluInput> {
    this.features = {};
    this.intents = {};
    this.intentsArr = undefined;
    this.intentFeatures = {};
    const input = srcInput;
    const corpus = input.corpus as CorpusEntry[];
    const result: PreparedCorpusEntry[] = [];
    for (let i = 0; i < corpus.length; i += 1) {
      const { intent } = corpus[i];
      const item: PreparedCorpusEntry = {
        input: (await this.prepare(
          corpus[i].utterance,
          input.settings
        )) as TokenMap,
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

  addNoneFeature(input: NluInput): NluInput {
    const corpus = input.corpus as PreparedCorpusEntry[];
    if (input.settings && input.settings.useNoneFeature) {
      corpus.push({ input: { nonefeature: 1 }, output: { None: 1 } });
    }
    return input;
  }

  /** Turns the score per intent a classifier produced into a sorted answer. */
  convertToArray(srcInput: NluInput): NluInput {
    const input = srcInput;
    const classifications = input.classifications as Record<Intent, number>;
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
      const result: Classification[] = [];
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

  someSimilar(tokensA: TokenMap, tokensB: Token[]): boolean {
    for (let i = 0; i < tokensB.length; i += 1) {
      if (tokensA[tokensB[i]]) {
        return true;
      }
    }
    return false;
  }

  matchAllowList(intent: Intent, allowList: string[]): boolean {
    for (let i = 0; i < allowList.length; i += 1) {
      if (compareWildcars(intent, allowList[i])) {
        return true;
      }
    }
    return false;
  }

  intentIsActivated(
    intent: Intent,
    tokens: TokenMap,
    allowList?: AllowList
  ): boolean {
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

  /** Zeroes the score of any intent none of the utterance's stems trained. */
  filterNonActivated(srcInput: NluInput): NluInput {
    const classifications = srcInput.classifications as Classification[];
    if (this.intentFeatures && classifications) {
      const intents = classifications.map((x) => x.intent);
      let someModified = false;
      for (let i = 0; i < intents.length; i += 1) {
        const intent = intents[i];
        if (intent !== 'None') {
          if (
            !this.intentIsActivated(
              intent,
              srcInput.tokens as TokenMap,
              srcInput.settings.allowList
            )
          ) {
            classifications[i].score = 0;
            someModified = true;
          }
        }
      }
      if (someModified) {
        classifications.sort((a, b) => b.score - a.score);
      }
    }
    return srcInput;
  }

  /** Squares the scores and scales them so that they add up to one. */
  normalizeClassifications(srcInput: NluInput): NluInput {
    const input = srcInput;
    const classifications = input.classifications as Classification[];
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

  /**
   * Keeps the tokens the classifier was trained on, and turns the rest into
   * the artificial `nonefeature` whose weight grows with how many there were.
   */
  textToFeatures(srcInput: NluInput): NluInput {
    const input = srcInput;
    const tokens = input.tokens as TokenMap;
    const keys = Object.keys(tokens);
    let unknownTokens = 0;
    const features: TokenMap = {};
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
        : input.settings.nonedeltaValue;
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

  async innerTrain(_srcInput?: NluInput): Promise<NluInput> {
    throw new Error('This method should be implemented by child classes');
  }

  innerProcess(_srcInput?: NluInput): NluInput {
    throw new Error('This method should be implemented by child classes');
  }

  async train(
    corpus?: CorpusEntry[],
    settings?: NluSettings
  ): Promise<NluInput> {
    const input: NluInput = {
      corpus,
      settings: this.applySettings(settings, this.settings),
    };
    return this.runPipeline(input, this.pipelineTrain);
  }

  /** Pairs every stem of an utterance with the weight it carried. */
  async getExplanation(
    input: NluInput,
    explanation?: NeuralExplanation
  ): Promise<ExplanationEntry[] | undefined> {
    if (!explanation) {
      return undefined;
    }
    const normalized = await this.container
      .get<PipelineStage>('normalize')
      .run(input);
    const tokenized = await this.container
      .get<PipelineStage>('tokenize')
      .run(normalized);
    const tokens = tokenized.tokens as Token[];
    const stemmed = await this.container
      .get<PipelineStage>('stem')
      .run(tokenized);
    const stems = stemmed.tokens as Token[];
    const result: ExplanationEntry[] = [];
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

  async process(
    utterance: string,
    settings?: NluSettings,
    _arg2?: unknown,
    _arg3?: unknown
  ): Promise<NluResult | NluInput> {
    const input: NluInput = {
      text: utterance,
      settings: this.applySettings(settings || {}, this.settings),
    };
    let output: NluInput;
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

  toJSON(): NluJson {
    const result: NluJson = {
      settings: { ...this.settings },
      features: this.features,
      intents: this.intents,
      intentFeatures: this.intentFeatures,
      featuresToIntent: this.featuresToIntent,
    };
    delete result.settings.container;
    return result;
  }

  fromJSON(json: NluJson): void {
    this.applySettings(this.settings, json.settings);
    this.features = json.features || {};
    this.intents = json.intents || {};
    this.intentsArr = undefined;
    this.featuresToIntent = json.featuresToIntent || {};
    this.intentFeatures = json.intentFeatures || {};
    this.spellCheck.setFeatures(this.features);
    this.numFeatures = Object.keys(this.features).length;
    this.numIntents = Object.keys(this.intents).length;
  }
}

export default Nlu;
