import { Clonable, compareWildcars } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Logger,
  RegisteredPipeline,
  Token,
  TokenMap,
} from '@nlpjs-neo/core';
import type Nlu from './nlu.js';
import type {
  AllowList,
  Classification,
  CorpusEntry,
  Domain,
  DomainClassification,
  DomainManagerInput,
  DomainManagerJson,
  DomainManagerSettings,
  DomainSentence,
  Intent,
  NluResult,
  NluSettings,
  StemDictEntry,
} from './types.js';

const defaultDomainName = 'master_domain';

/** The stemmer stage, resolved once and reused while training. */
interface TrainCache {
  stem: {
    addForTraining(input: DomainManagerInput): Promise<unknown>;
    train(input: DomainManagerInput): Promise<unknown>;
  };
}

class DomainManager extends Clonable {
  declare cache: TrainCache | undefined;
  /** One classifier per domain, plus the one that classifies the domains. */
  declare domains: Record<Domain, Nlu>;
  /** Domain each known intent belongs to. */
  declare intentDict: Record<Intent, Domain>;
  declare pipelineProcess: RegisteredPipeline | undefined;
  declare pipelineTrain: RegisteredPipeline | undefined;
  declare sentences: DomainSentence[];
  declare settings: DomainManagerSettings;
  /** Sorted stems of a training utterance mapped to what it resolves to. */
  declare stemDict: Record<string, StemDictEntry>;

  constructor(
    settings: DomainManagerSettings = {},
    container?: ContainerHolder
  ) {
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
      this.settings.tag = `domain-manager-${this.settings.locale}`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.domains = {};
    this.addDomain(defaultDomainName);
    this.stemDict = {};
    this.intentDict = {};
    this.sentences = [];
    this.applySettings(this, {
      pipelineTrain: this.getPipeline(`${this.settings.tag}-train`),
      pipelineProcess: this.getPipeline(`${this.settings.tag}-process`),
    });
  }

  registerDefault(): void {
    this.container.registerConfiguration(
      'domain-manager-??',
      {
        nluByDomain: {
          default: {
            className: 'NeuralNlu',
            settings: {},
          },
        },
        trainByDomain: false,
        useStemDict: true,
      },
      false
    );
    this.container.registerPipeline(
      'domain-manager-??-train',
      [
        '.trainStemmer',
        '.generateCorpus',
        '.fillStemDict',
        '.innerTrain',
        'output.status',
      ],
      false
    );
  }

  getDomainInstance(domainName: Domain): Nlu {
    if (!this.settings.nluByDomain) {
      this.settings.nluByDomain = {};
    }
    const domainSettings = this.settings.nluByDomain[domainName] ||
      this.settings.nluByDomain.default || {
        className: 'NeuralNlu',
        settings: {},
      };
    return this.container.get<Nlu>(
      domainSettings.className || 'NeuralNlu',
      this.applySettings(
        { locale: this.settings.locale },
        domainSettings.settings || {}
      )
    );
  }

  addDomain(name: Domain): Nlu {
    if (!this.domains[name]) {
      this.domains[name] = this.getDomainInstance(name);
    }
    return this.domains[name];
  }

  removeDomain(name: Domain): void {
    delete this.domains[name];
  }

  /** Key an utterance is remembered under: its stems, sorted and joined. */
  async generateStemKey(
    srcTokens: string | TokenMap | Token[]
  ): Promise<string> {
    let stems: TokenMap | Token[];
    if (typeof srcTokens !== 'string') {
      stems = srcTokens;
    } else {
      const input = (await this.prepare({
        utterance: srcTokens,
      })) as DomainManagerInput;
      stems = (await input.stems) as TokenMap;
    }
    const tokens: Token[] = Array.isArray(stems) ? stems : Object.keys(stems);
    return tokens.slice().sort().join();
  }

  /** Adds an utterance, with the domain defaulted when only two are given. */
  add(domain: Domain, utterance: string, intent?: Intent): void {
    if (!intent) {
      this.sentences.push({
        domain: defaultDomainName,
        utterance: domain,
        intent: utterance,
      });
    } else {
      this.sentences.push({ domain, utterance, intent });
    }
  }

  getSentences(): DomainSentence[] {
    return this.sentences;
  }

  remove(srcDomain: string, srcUtterance: string, srcIntent?: Intent): boolean {
    const domain = srcIntent ? srcDomain : defaultDomainName;
    const utterance = srcIntent ? srcUtterance : srcDomain;
    const intent = srcIntent || srcUtterance;
    for (let i = 0; i < this.sentences.length; i += 1) {
      const sentence = this.sentences[i];
      if (
        sentence.domain === domain &&
        sentence.utterance === utterance &&
        sentence.intent === intent
      ) {
        this.sentences.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  async trainStemmer(
    srcInput: DomainManagerInput
  ): Promise<DomainManagerInput> {
    const input = srcInput;
    if (!this.cache) {
      this.cache = {
        stem: this.container.get<TrainCache['stem']>('stem'),
      };
    }
    for (let i = 0; i < this.sentences.length; i += 1) {
      const current = this.sentences[i];
      const subInput = { ...current, ...input };
      await this.cache.stem.addForTraining(subInput);
    }
    await this.cache.stem.train(input);
    return input;
  }

  /**
   * Groups the utterances by domain. Without a domain name every domain gets
   * its own corpus and the master domain learns which domain an utterance is
   * in; with one, every utterance goes into that single corpus.
   */
  innerGenerateCorpus(domainName?: Domain): Record<Domain, CorpusEntry[]> {
    this.intentDict = {};
    const result: Record<Domain, CorpusEntry[]> = {};
    result[defaultDomainName] = [];
    for (let i = 0; i < this.sentences.length; i += 1) {
      const sentence = this.sentences[i];
      this.intentDict[sentence.intent] = sentence.domain;
      const domain = domainName || sentence.domain;
      if (!result[domain]) {
        result[domain] = [];
      }
      const domainObj = result[domain];
      domainObj.push({
        utterance: sentence.utterance,
        intent: sentence.intent,
      });
      if (!domainName) {
        result[defaultDomainName].push({
          utterance: sentence.utterance,
          intent: sentence.domain,
        });
      }
    }
    return result;
  }

  async generateCorpus(
    srcInput: DomainManagerInput
  ): Promise<DomainManagerInput> {
    const input = srcInput;
    input.corpus = this.innerGenerateCorpus(
      this.settings.trainByDomain ? undefined : defaultDomainName
    );
    return input;
  }

  async prepare(
    srcInput: string | DomainManagerInput
  ): Promise<TokenMap | DomainManagerInput> {
    const input = srcInput;
    const isString = typeof input === 'string';
    const utterance = isString ? input : input.utterance;
    const nlu = this.addDomain(defaultDomainName);
    const tokens = nlu.prepare(utterance) as Promise<TokenMap>;
    if (isString) {
      return tokens;
    }
    input.stems = tokens;
    return input;
  }

  async fillStemDict(
    srcInput: DomainManagerInput
  ): Promise<DomainManagerInput> {
    this.stemDict = {};
    for (let i = 0; i < this.sentences.length; i += 1) {
      const { utterance, intent, domain } = this.sentences[i];
      const key = await this.generateStemKey(utterance);
      if (!key || key === '') {
        this.container
          .get<Logger>('logger')
          .warn(`This utterance: "${utterance}" contains only stop words`);
      }
      this.stemDict[key] = {
        intent,
        domain,
      };
    }
    return srcInput;
  }

  async innerTrain(srcInput: DomainManagerInput): Promise<DomainManagerInput> {
    const input = srcInput;
    const corpus = input.corpus as Record<Domain, CorpusEntry[]>;
    const keys = Object.keys(corpus);
    const status: Record<Domain, unknown> = {};
    for (let i = 0; i < keys.length; i += 1) {
      const nlu = this.addDomain(keys[i]);
      const options: NluSettings = {
        useNoneFeature: this.settings.useNoneFeature,
      };
      if (srcInput.settings && srcInput.settings.log !== undefined) {
        options.log = srcInput.settings.log;
      }
      const result = await nlu.train(corpus[keys[i]], options);
      status[keys[i]] = result.status;
    }
    input.status = status;
    return input;
  }

  async train(settings?: DomainManagerSettings): Promise<DomainManagerInput> {
    const input = {
      domainManager: this,
      settings: settings || this.settings,
    };
    return this.runPipeline(input, this.pipelineTrain);
  }

  matchAllowList(intent: Intent, allowList: string[]): boolean {
    for (let i = 0; i < allowList.length; i += 1) {
      if (compareWildcars(intent, allowList[i])) {
        return true;
      }
    }
    return false;
  }

  /** Answers an utterance whose exact stems were seen while training. */
  async classifyByStemDict(
    utterance: string,
    domainName?: Domain,
    allowList?: AllowList
  ): Promise<DomainClassification | undefined> {
    const key = await this.generateStemKey(utterance);
    const resolved = this.stemDict[key];
    if (resolved && (!domainName || resolved.domain === domainName)) {
      // Only the pattern list form is honoured here: a lookup set has no
      // `length`, so no pattern matches and the shortcut is skipped.
      if (
        allowList &&
        !this.matchAllowList(resolved.intent, allowList as string[])
      ) {
        return undefined;
      }
      const classifications: Classification[] = [];
      classifications.push({
        intent: resolved.intent,
        score: 1,
      });
      const intents = Object.keys(this.intentDict);
      for (let i = 0; i < intents.length; i += 1) {
        if (intents[i] !== resolved.intent) {
          classifications.push({ intent: intents[i], score: 0 });
        }
      }
      return { domain: resolved.domain, classifications };
    }
    return undefined;
  }

  async innerClassify(
    srcInput: DomainManagerInput,
    domainName?: Domain
  ): Promise<DomainManagerInput> {
    const input = srcInput;
    const settings = this.applySettings({ ...input.settings }, this.settings);
    if (settings.useStemDict) {
      const result = await this.classifyByStemDict(
        input.utterance,
        domainName,
        srcInput.settings ? srcInput.settings.allowList : undefined
      );
      if (result) {
        input.classification = result;
        input.explanation = [
          {
            token: '',
            stem: '##exact',
            weight: 1,
          },
        ];
        return input;
      }
    }
    if (domainName) {
      const nlu = this.domains[domainName];
      if (!nlu) {
        input.classification = {
          domain: 'default',
          classifications: [{ intent: 'None', score: 1 }],
        };
        return input;
      }
      const nluAnswer = await nlu.process(
        input.utterance,
        input.settings || this.settings
      );
      let classifications: Classification[];
      if (Array.isArray(nluAnswer)) {
        classifications = nluAnswer;
      } else {
        // The whole answer is kept, not only its classifications: it is
        // what the caller reads back as `nluAnswer`.
        classifications = (nluAnswer as NluResult).classifications;
        input.nluAnswer = nluAnswer as NluResult;
      }
      let finalDomain: Domain;
      if (domainName === defaultDomainName) {
        if (classifications && classifications.length) {
          finalDomain = this.intentDict[classifications[0].intent];
        } else {
          finalDomain = defaultDomainName;
        }
      } else {
        finalDomain = domainName;
      }
      input.classification = {
        domain: finalDomain,
        classifications,
      };
      return input;
    }
    let domain = defaultDomainName;
    if (
      (input.settings.trainByDomain === undefined &&
        this.settings.trainByDomain) ||
      input.settings.trainByDomain
    ) {
      const nlu = this.domains[defaultDomainName];
      const answer = await nlu.process(input.utterance);
      const classifications = (
        (answer as NluResult).classifications
          ? (answer as NluResult).classifications
          : answer
      ) as Classification[];
      if (Object.keys(this.domains).length === 1) {
        input.classification = {
          domain: 'default',
          classifications,
        };
        return input;
      }
      domain = classifications[0].intent;
      if (domain === 'None') {
        input.classification = {
          domain: 'default',
          classifications: [{ intent: 'None', score: 1 }],
        };
        return input;
      }
    }
    return this.innerClassify(input, domain);
  }

  async defaultPipelineProcess(
    input: DomainManagerInput
  ): Promise<DomainClassification | undefined> {
    const output = await this.innerClassify(input);
    return output.classification;
  }

  async process(
    utterance: string | DomainManagerInput,
    settings?: DomainManagerSettings,
    _arg2?: unknown,
    _arg3?: unknown
  ): Promise<DomainClassification | undefined> {
    const input: DomainManagerInput =
      typeof utterance === 'string'
        ? {
            utterance,
            settings: settings || this.settings,
          }
        : utterance;
    if (this.pipelineProcess) {
      return this.runPipeline(input, this.pipelineProcess);
    }
    return this.defaultPipelineProcess(input);
  }

  toJSON(): DomainManagerJson {
    const result: DomainManagerJson = {
      settings: this.settings,
      stemDict: this.stemDict,
      intentDict: this.intentDict,
      sentences: this.sentences,
      domains: {},
    };
    delete result.settings.container;
    const keys = Object.keys(this.domains);
    for (let i = 0; i < keys.length; i += 1) {
      result.domains[keys[i]] = this.domains[keys[i]].toJSON();
    }
    return result;
  }

  fromJSON(json: DomainManagerJson): void {
    this.applySettings(this.settings, json.settings);
    this.stemDict = json.stemDict;
    this.intentDict = json.intentDict;
    this.sentences = json.sentences;
    const keys = Object.keys(json.domains);
    for (let i = 0; i < keys.length; i += 1) {
      const domain = this.addDomain(keys[i]);
      domain.fromJSON(json.domains[keys[i]]);
    }
  }
}

export default DomainManager;
