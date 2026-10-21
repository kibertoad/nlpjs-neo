import { Clonable, containerBootstrap } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Locale,
  Storage,
} from '@nlpjs-neo/core';
import { NluManager, NluNeural } from '@nlpjs-neo/nlu';
import type {
  Domain,
  Intent,
  NluManagerInput,
  NluSettings,
} from '@nlpjs-neo/nlu';
import {
  Ner,
  ExtractorEnum,
  ExtractorRegex,
  ExtractorTrim,
  ExtractorBuiltin,
} from '@nlpjs-neo/ner';
import type {
  Edge,
  EntityName,
  NerInput,
  Rule,
  RuleCondition,
  TrimOptions,
  TrimTypeValue,
} from '@nlpjs-neo/ner';
import { ActionManager, NlgManager } from '@nlpjs-neo/nlg';
import type {
  ActionFunction,
  Answer,
  AnswerOptions,
  AnswerPayload,
  NlgInput,
} from '@nlpjs-neo/nlg';
import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
import { SlotManager } from '@nlpjs-neo/slot';
import type { SlotFillingResult } from '@nlpjs-neo/slot';
import ContextManager from './context-manager.js';
import type {
  ActionDefinition,
  Context,
  Corpus,
  CorpusImporter,
  CorpusIntent,
  CorpusDomain,
  EntityDefinition,
  ImportedCorpus,
  IntentHandler,
  NlpJson,
  NlpResult,
  NlpSettings,
  NluClassSettings,
  OpenQuestionService,
  SlotDefinition,
  StructuredEntity,
} from './types.js';

/** The stemmer of a locale, when it fills in what it recognized itself. */
interface FillingStemmer {
  lastFill?(output: NlpResult): void;
}

class Nlp extends Clonable {
  declare actionManager: ActionManager;
  declare contextManager: ContextManager;
  /** Extracts entities even when no intent needs a slot filled. */
  declare forceNER: boolean;
  declare ner: Ner;
  declare nlgManager: NlgManager;
  declare nluManager: NluManager;
  /** Called after every recognition, instead of the `onIntent(...)` pipeline. */
  declare onIntent: IntentHandler | undefined;
  declare sentiment: SentimentAnalyzer;
  declare settings: NlpSettings;
  declare slotManager: SlotManager;

  constructor(settings: NlpSettings = {}, container?: ContainerHolder) {
    super(
      {
        settings: {},
        container:
          settings.container ||
          (container &&
            ((container as { container?: Container }).container ||
              (container as Container))) ||
          containerBootstrap(),
      },
      container as Container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = `nlp`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.nluManager = this.container.get<NluManager>(
      'nlu-manager',
      this.settings.nlu
    );
    this.ner = this.container.get<Ner>('ner', this.settings.ner);
    this.nlgManager = this.container.get<NlgManager>(
      'nlg-manager',
      this.settings.nlg
    );
    this.actionManager = this.container.get<ActionManager>(
      'action-manager',
      this.settings.action
    );
    this.sentiment = this.container.get<SentimentAnalyzer>(
      'sentiment-analyzer',
      this.settings.sentiment
    );
    this.slotManager = this.container.get<SlotManager>(
      'SlotManager',
      this.settings.slot
    );
    this.contextManager = this.container.get<ContextManager>(
      'context-manager',
      this.settings.context
    );
    this.forceNER = this.settings.forceNER;
    if (this.forceNER === undefined) {
      this.forceNER = false;
    }
    this.initialize();
  }

  registerDefault(): void {
    this.container.registerConfiguration(
      'nlp',
      {
        threshold: 0.5,
        autoLoad: true,
        autoSave: true,
        modelFileName: 'model.nlp',
        executeActionsBeforeAnswers: false,
      },
      false
    );
    this.use(NluManager);
    this.use(Ner);
    this.use(ExtractorEnum);
    this.use(ExtractorRegex);
    this.use(ExtractorTrim);
    this.use(ExtractorBuiltin);
    this.use(NlgManager);
    this.use(ActionManager);
    this.use(NluNeural);
    this.use(SentimentAnalyzer);
    this.use(ContextManager);
    this.container.register('SlotManager', SlotManager, false);
  }

  initialize(): void {
    if (this.settings.nlu) {
      const locales = Object.keys(this.settings.nlu);
      for (let i = 0; i < locales.length; i += 1) {
        const locale = locales[i];
        const domains = Object.keys(this.settings.nlu[locale]);
        for (let j = 0; j < domains.length; j += 1) {
          const domain = domains[j];
          const settings = (
            this.settings.nlu[locale] as Record<Domain, NluClassSettings>
          )[domain];
          const { className } = settings;
          delete settings.className;
          this.useNlu(className, locale, domain, settings);
        }
      }
    }
    if (this.settings.languages) {
      this.addLanguage(this.settings.languages);
    }
    if (this.settings.locales) {
      this.addLanguage(this.settings.locales);
    }
    if (this.settings.calculateSentiment === undefined) {
      this.settings.calculateSentiment = true;
    }
    if (this.settings.executeActionsBeforeAnswers === undefined) {
      this.settings.executeActionsBeforeAnswers = false;
    }
  }

  async start(): Promise<void> {
    if (this.settings.corpora) {
      await this.addCorpora(this.settings.corpora);
    }
  }

  async loadOrTrain(): Promise<void> {
    let loaded = false;
    if (this.settings.autoLoad) {
      loaded = await this.load(this.settings.modelFileName);
    }
    if (!loaded) {
      await this.train();
    }
  }

  /** Records which classifier a locale and domain are handled by. */
  useNlu(
    clazz: string | Parameters<Container['use']>[0],
    locale: Locale | Locale[] | undefined,
    domain: Domain | undefined,
    settings: NluSettings
  ): void {
    if (!locale) {
      locale = '??';
    }
    if (Array.isArray(locale)) {
      for (let i = 0; i < locale.length; i += 1) {
        this.useNlu(clazz, locale[i], domain, settings);
      }
    } else {
      const className =
        typeof clazz === 'string' ? clazz : this.container.use(clazz);
      let config = this.container.getConfiguration(`domain-manager-${locale}`);
      if (!config) {
        config = {};
        this.container.registerConfiguration(
          `domain-manager-${locale}`,
          config
        );
      }
      if (!config.nluByDomain) {
        config.nluByDomain = {};
      }
      const domainName = !domain || domain === '*' ? 'default' : domain;
      if (!config.nluByDomain[domainName]) {
        config.nluByDomain[domainName] = {};
      }
      config.nluByDomain[domainName].className = className;
      config.nluByDomain[domainName].settings = settings;
    }
  }

  guessLanguage(input: string): Locale | undefined {
    return this.nluManager.guessLanguage(input) as Locale | undefined;
  }

  addLanguage(locales: Locale | Locale[]): void {
    return this.nluManager.addLanguage(locales);
  }

  removeLanguage(locales: Locale | Locale[]): void {
    return this.nluManager.removeLanguage(locales);
  }

  /**
   * Trains every enum entity of an utterance as the texts it stands for, so
   * the classifier sees the sentences a user would actually say.
   */
  addAdditionalEnumEntityUtterances(): void {
    if (!this.settings.languages) {
      return;
    }
    this.settings.languages.forEach((locale) => {
      const replaceTexts: Record<string, string[]> = {};
      const rules = this.ner.getRules(locale);
      rules.forEach((rule: Rule) => {
        if (rule.type === 'enum') {
          const entityName = this.ner.nameToEntity(rule.name);
          replaceTexts[entityName] = replaceTexts[entityName] || [];
          rule.rules.forEach((value: RuleCondition) => {
            replaceTexts[entityName] = replaceTexts[entityName].concat(
              (value as { texts: string[] }).texts
            );
          });
        }
      });
      const manager = this.nluManager.consolidateManager(locale);
      const sentences = manager.getSentences();
      sentences.forEach((sentence) => {
        const entities = this.ner
          .getEntitiesFromUtterance(locale, sentence.utterance)
          .map((entityName) => this.ner.nameToEntity(entityName));
        this.replaceEnumEntitiesInSentence(
          manager,
          locale,
          sentence.domain,
          sentence.utterance,
          sentence.intent,
          entities,
          replaceTexts
        );
      });
    });
  }

  replaceEnumEntitiesInSentence(
    manager: ReturnType<NluManager['consolidateManager']>,
    locale: Locale,
    domain: Domain,
    utterance: string,
    intent: Intent,
    entityList: string[],
    replaceTexts: Record<string, string[]>
  ): void {
    if (!entityList.length) {
      this.nluManager.guesser.addExtraSentence(locale, utterance);
      manager.add(domain, utterance, intent);
      return;
    }
    const entityName = entityList[0];
    if (replaceTexts[entityName] && replaceTexts[entityName].length) {
      replaceTexts[entityName].forEach((replaceText) => {
        const entityUtterance = utterance.replace(entityName, replaceText);
        this.replaceEnumEntitiesInSentence(
          manager,
          locale,
          domain,
          entityUtterance,
          intent,
          entityList.slice(1),
          replaceTexts
        );
      });
    } else {
      this.replaceEnumEntitiesInSentence(
        manager,
        locale,
        domain,
        utterance,
        intent,
        entityList.slice(1),
        replaceTexts
      );
    }
  }

  addDocument(locale: Locale, utterance: string, intent: Intent): void {
    const entities = this.ner.getEntitiesFromUtterance(utterance);
    this.slotManager.addBatch(intent, entities);
    return this.nluManager.add(locale, utterance, intent);
  }

  removeDocument(locale: Locale, utterance: string, intent: Intent): void {
    return this.nluManager.remove(locale, utterance, intent);
  }

  getRulesByName(locale: Locale, name: EntityName): Rule | undefined {
    return this.ner.getRulesByName(locale, name);
  }

  addNerRule(
    locale: Locale | Locale[],
    name: EntityName,
    type: Rule['type'],
    rule: RuleCondition
  ): void {
    return this.ner.addRule(locale, name, type, rule);
  }

  removeNerRule(locale: Locale, name: EntityName, rule?: RuleCondition): void {
    return this.ner.removeRule(locale, name, rule);
  }

  addNerRuleOptionTexts(
    locale: Locale | Locale[],
    name: EntityName,
    option: string,
    texts?: string | string[]
  ): void {
    return this.ner.addRuleOptionTexts(locale, name, option, texts);
  }

  removeNerRuleOptionTexts(
    locale: Locale | Locale[],
    name: EntityName,
    option: string,
    texts?: string | string[]
  ): void {
    return this.ner.removeRuleOptionTexts(locale, name, option, texts);
  }

  addNerRegexRule(
    locale: Locale | Locale[],
    name: EntityName,
    regex: string | RegExp
  ): void {
    return this.ner.addRegexRule(locale, name, regex);
  }

  addNerBetweenCondition(
    locale: Locale | Locale[],
    name: EntityName,
    left: string | string[],
    right: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addBetweenCondition(locale, name, left, right, opts);
  }

  addNerBetweenLastCondition(
    locale: Locale | Locale[],
    name: EntityName,
    left: string | string[],
    right: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addBetweenLastCondition(locale, name, left, right, opts);
  }

  addNerPositionCondition(
    locale: Locale | Locale[],
    name: EntityName,
    position: TrimTypeValue,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addPositionCondition(locale, name, position, words, opts);
  }

  addNerAfterCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addAfterCondition(locale, name, words, opts);
  }

  addNerAfterFirstCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addAfterFirstCondition(locale, name, words, opts);
  }

  addNerAfterLastCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addAfterLastCondition(locale, name, words, opts);
  }

  addNerBeforeCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addBeforeCondition(locale, name, words, opts);
  }

  addNerBeforeFirstCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addBeforeFirstCondition(locale, name, words, opts);
  }

  addNerBeforeLastCondition(
    locale: Locale | Locale[],
    name: EntityName,
    words: string | string[],
    opts?: TrimOptions
  ): void {
    return this.ner.addBeforeLastCondition(locale, name, words, opts);
  }

  assignDomain(locale: Locale, intent: Intent, domain?: Domain): void {
    return this.nluManager.assignDomain(locale, intent, domain);
  }

  getIntentDomain(locale: Locale, intent: Intent): Domain {
    return this.nluManager.getIntentDomain(locale, intent);
  }

  getDomains(): ReturnType<NluManager['getDomains']> {
    return this.nluManager.getDomains();
  }

  addAction(
    intent: Intent,
    action: string,
    parameters: unknown[],
    fn?: ActionFunction
  ): void {
    return this.actionManager.addAction(intent, action, parameters, fn);
  }

  registerActionFunction(action: string, fn: ActionFunction): void {
    return this.actionManager.registerActionInMap(action, fn);
  }

  getActions(intent: Intent): ReturnType<ActionManager['findActions']> {
    return this.actionManager.findActions(intent);
  }

  removeAction(intent: Intent, action: string, parameters: unknown[]): void {
    return this.actionManager.removeAction(intent, action, parameters);
  }

  removeActions(intent: Intent): void {
    return this.actionManager.removeActions(intent);
  }

  removeActionFunction(action: string): void {
    return this.actionManager.removeActionFromMap(action);
  }

  addAnswer(
    locale: Locale,
    intent: Intent,
    answer: AnswerPayload,
    opts?: string | AnswerOptions
  ): ReturnType<NlgManager['add']> {
    return this.nlgManager.add(locale, intent, answer, opts);
  }

  removeAnswer(
    locale: Locale,
    intent: Intent,
    answer: AnswerPayload,
    opts?: string | AnswerOptions
  ): void {
    return this.nlgManager.remove(locale, intent, answer, opts);
  }

  findAllAnswers(locale: Locale, intent: Intent, _arg2?: unknown): Answer[] {
    const response = this.nlgManager.findAllAnswers({
      locale,
      intent,
    }) as NlgInput;
    return response.answers;
  }

  async addCorpora(
    names?:
      | (string | Corpus | ImportedCorpus)
      | (string | Corpus | ImportedCorpus)[]
  ): Promise<void> {
    if (names) {
      if (Array.isArray(names)) {
        for (let i = 0; i < names.length; i += 1) {
          await this.addCorpus(names[i]);
        }
      } else {
        await this.addCorpus(names);
      }
    }
  }

  /** Reads a corpus through the importer it names, then adds what it holds. */
  async addImported(input: ImportedCorpus): Promise<void> {
    let content: string;
    if (input.content) {
      content = input.content;
    } else if (input.filename) {
      const fs = this.container.get<
        Storage & { readFile(name: string): Promise<string> }
      >('fs');
      content = await fs.readFile(input.filename);
      if (!content) {
        throw new Error(`Corpus not found "${input.filename}"`);
      }
    } else {
      throw new Error('Corpus information without content or file name');
    }
    let importer = this.container.get<CorpusImporter>(input.importer);
    if (!importer) {
      importer = this.container.get<CorpusImporter>(
        `${input.importer}-importer`
      );
    }
    if (!importer) {
      throw new Error(`Corpus importer not found: ${input.importer}`);
    }
    const corpora = importer.transform(content, input);
    await Promise.all(corpora.map((corpus) => this.addCorpus(corpus)));
  }

  addEntities(
    entities: Record<EntityName, EntityDefinition | string>,
    locale?: Locale
  ): void {
    const keys = Object.keys(entities);
    for (let i = 0; i < keys.length; i += 1) {
      const entityName = keys[i];
      let entity = entities[entityName] as EntityDefinition;
      if (typeof entity === 'string') {
        entity = { regex: [entity] };
      }
      let finalLocale = entity.locale;
      if (!finalLocale) {
        finalLocale = locale || 'en';
      }
      if (typeof finalLocale === 'string') {
        finalLocale = finalLocale.slice(0, 2);
      }
      if (entity.options) {
        const optionNames = Object.keys(entity.options);
        for (let j = 0; j < optionNames.length; j += 1) {
          this.addNerRuleOptionTexts(
            finalLocale,
            entityName,
            optionNames[j],
            entity.options[optionNames[j]]
          );
        }
      }
      if (entity.regex) {
        if (Array.isArray(entity.regex)) {
          for (let j = 0; j < entity.regex.length; j += 1) {
            this.addNerRegexRule(finalLocale, entityName, entity.regex[j]);
          }
        } else if (typeof entity.regex === 'string' && entity.regex.trim()) {
          this.addNerRegexRule(finalLocale, entityName, entity.regex);
        }
      }
      if (entity.trim) {
        for (let j = 0; j < entity.trim.length; j += 1) {
          switch (entity.trim[j].position) {
            case 'after':
            case 'afterLast':
            case 'afterFirst':
            case 'before':
            case 'beforeFirst':
            case 'beforeLast':
              this.addNerPositionCondition(
                finalLocale,
                entityName,
                entity.trim[j].position,
                entity.trim[j].words,
                entity.trim[j].opts
              );
              break;
            case 'between':
              this.addNerBetweenCondition(
                finalLocale,
                entityName,
                entity.trim[j].leftWords,
                entity.trim[j].rightWords,
                entity.trim[j].opts
              );
              break;
            case 'betweenLast':
              this.addNerBetweenLastCondition(
                finalLocale,
                entityName,
                entity.trim[j].leftWords,
                entity.trim[j].rightWords,
                entity.trim[j].opts
              );
              break;
            default:
              break;
          }
        }
      }
    }
  }

  addData(data: CorpusIntent[], locale: Locale, domain?: CorpusDomain): void {
    for (let i = 0; i < data.length; i += 1) {
      const current = data[i];
      const { intent, utterances, answers, slotFilling, actions } = current;
      for (let j = 0; j < utterances.length; j += 1) {
        if (domain) {
          this.assignDomain(locale, intent, domain.name);
        }
        this.addDocument(locale, utterances[j], intent);
      }
      if (answers) {
        for (let j = 0; j < answers.length; j += 1) {
          const answer = answers[j];
          if (typeof answer === 'string') {
            this.addAnswer(locale, intent, answer);
          } else if ('answer' in answer) {
            const { opts } = answer as { opts?: string | AnswerOptions };
            this.addAnswer(
              locale,
              intent,
              answer.answer as AnswerPayload,
              opts
            );
          } else {
            this.addAnswer(locale, intent, answer);
          }
        }
      }
      if (slotFilling) {
        const entities = Object.keys(slotFilling);
        for (let j = 0; j < entities.length; j += 1) {
          const slot = slotFilling[entities[j]] as SlotDefinition;
          let mandatory: boolean;
          const slotQuestions: Record<Locale, string> = {};
          if (typeof slot === 'string') {
            slotQuestions[locale] = slot;
            mandatory = true;
          } else {
            slotQuestions[locale] = slot.question;
            mandatory = slot.mandatory || false;
          }
          this.slotManager.updateSlot(
            intent,
            entities[j],
            mandatory,
            slotQuestions
          );
        }
      }
      if (actions) {
        actions.forEach((action: ActionDefinition) => {
          if (!action) return;
          if (typeof action === 'object') {
            if (!action.name) return;
            this.addAction(intent, action.name, action.parameters || []);
          } else {
            this.addAction(intent, action, []);
          }
        });
      }
    }
  }

  async addCorpus(fileName: string | Corpus | ImportedCorpus): Promise<void> {
    if ((fileName as ImportedCorpus).importer) {
      await this.addImported(fileName as ImportedCorpus);
    } else {
      let corpus = fileName as Corpus;
      const fs = this.container.get<{
        readFile(name: string): Promise<string>;
      }>('fs');
      if (typeof fileName === 'string') {
        const fileData = await fs.readFile(fileName);
        if (!fileData) {
          throw new Error(`Corpus not found "${fileName}"`);
        }
        corpus = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
      }
      if (corpus.contextData) {
        let { contextData } = corpus;
        if (typeof corpus.contextData === 'string') {
          contextData = JSON.parse(await fs.readFile(corpus.contextData));
        }
        const contextManager =
          this.container.get<ContextManager>('context-manager');
        const keys = Object.keys(contextData);
        for (let i = 0; i < keys.length; i += 1) {
          contextManager.defaultData[keys[i]] = contextData[keys[i]];
        }
      }
      if (corpus.domains) {
        if (corpus.entities) {
          this.addEntities(corpus.entities);
        }
        for (let i = 0; i < corpus.domains.length; i += 1) {
          const domain = corpus.domains[i];
          const { data, entities } = domain;
          const locale = domain.locale.slice(0, 2);
          this.addLanguage(locale);
          if (entities) {
            this.addEntities(entities, locale);
          }
          this.addData(data, locale, domain);
        }
      } else {
        const locale = corpus.locale.slice(0, 2);
        this.addLanguage(locale);
        const { data, entities } = corpus;
        if (entities) {
          this.addEntities(entities, locale);
        }
        this.addData(data, locale);
      }
    }
  }

  getSentiment(
    locale: Locale | Parameters<SentimentAnalyzer['process']>[0],
    utterance?: string
  ): ReturnType<SentimentAnalyzer['process']> {
    if (typeof locale === 'object') {
      return this.sentiment.process(locale);
    }
    if (!utterance) {
      utterance = locale;
      locale = this.guessLanguage(utterance);
    }
    return this.sentiment.process({ utterance, locale });
  }

  describeLanguage(locale: Locale, name: string): void {
    this.nluManager.describeLanguage(locale, name);
  }

  async train(_arg0?: unknown): Promise<unknown> {
    this.nluManager.addLanguage(this.settings.languages);
    const result = await this.nluManager.train();
    if (this.settings.autoSave) {
      await this.save(this.settings.modelFileName, true);
    }
    return result;
  }

  /**
   * Classifies an utterance without extracting entities or choosing an
   * answer.
   *
   * The settings are passed where the manager takes the domain, which nothing
   * reads, so what is passed here never reaches the classifier: an
   * `allowList` given to this method has no effect, and the test suite pins
   * that. Moving it to the settings argument would change what every existing
   * caller gets back, so it stays where it has always been.
   */
  async classify(
    locale: Locale,
    utterance?: string,
    settings?: NluSettings
  ): Promise<NluManagerInput> {
    return this.nluManager.process(
      locale,
      utterance,
      (settings || this.settings.nlu) as unknown as Domain
    );
  }

  async extractEntities(
    locale: Locale | Parameters<Ner['process']>[0],
    utterance?: string,
    context?: Context,
    settings?: Parameters<Ner['process']>[0]['settings']
  ): Promise<ReturnType<Ner['process']>> {
    if (typeof locale === 'object') {
      return this.ner.process(locale);
    }
    // Called with one argument, that argument is the utterance and the
    // locale is guessed from it.
    let text = utterance;
    let finalLocale: Locale | undefined = locale;
    if (!text) {
      text = locale;
      finalLocale = undefined;
    }
    if (!finalLocale) {
      finalLocale = this.guessLanguage(text);
    }
    const output = await this.ner.process({
      locale: finalLocale,
      utterance: text,
      context,
      settings: this.applySettings(settings, this.settings.ner),
    });
    return output;
  }

  /** Groups the entities found under one name into a list under that name. */
  organizeEntities(entities: (Edge | StructuredEntity)[]): StructuredEntity[] {
    const dict: Record<EntityName, StructuredEntity[]> = {};
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i] as StructuredEntity;
      if (!dict[entity.entity]) {
        dict[entity.entity] = [];
      }
      dict[entity.entity].push(entity);
    }
    const result: StructuredEntity[] = [];
    Object.keys(dict).forEach((key) => {
      const arr = dict[key];
      if (arr.length === 1) {
        result.push(arr[0]);
      } else {
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].alias = `${key}_${i}`;
        }
        result.push({
          entity: key,
          isList: true,
          items: arr,
        });
      }
    });
    return result;
  }

  /** Publishes every entity of a result on the context, by name and by alias. */
  structureEntities(output: NlpResult): NlpResult {
    const organizedEntities = this.organizeEntities(output.entities);
    if (!output.context.entities) {
      output.context.entities = {};
    }
    for (let i = 0; i < organizedEntities.length; i += 1) {
      const entity = organizedEntities[i];
      output.context.entities[entity.entity] = entity;
      if (entity.alias) {
        output.context[entity.alias] = entity.sourceText;
      }
      if (entity.isList) {
        for (let j = 0; j < entity.items.length; j += 1) {
          output.context[entity.items[j].alias] = entity.items[j].sourceText;
        }
      } else {
        // assume that there could be more than one entity with the same name
        output.context[`${entity.entity}_0`] = entity.sourceText;
      }
      output.context[entity.entity] = entity.isList
        ? entity.items[0].sourceText
        : entity.sourceText;
    }
    return output;
  }

  async process(
    locale: Locale | NlpResult,
    utterance?: string | { value?: string },
    srcContext?: Context,
    settings?: NlpSettings
  ): Promise<NlpResult> {
    let sourceInput: NlpResult | undefined;
    let context = srcContext;
    // The arguments are positional but overloaded: an object in the locale's
    // place is the whole input, unless the second argument is a resolved
    // pipeline value, in which case it is the utterance.
    let finalLocale: Locale | undefined;
    let text: string | undefined;
    if (typeof locale === 'object') {
      if (typeof utterance === 'object' && utterance.value) {
        text = utterance.value;
      } else {
        sourceInput = locale;
      }
    } else {
      finalLocale = locale;
      text = utterance as string | undefined;
    }
    if (!sourceInput) {
      if (!text) {
        text = finalLocale;
        finalLocale = undefined;
      }
      if (!finalLocale) {
        finalLocale = this.guessLanguage(text);
      }
      sourceInput = {
        locale: finalLocale,
        utterance: text,
        settings,
      };
      if (settings) {
        if (settings.activity && !sourceInput.activity) {
          sourceInput.activity = settings.activity;
        }
        if (settings.conversationId && !sourceInput.activity) {
          sourceInput.activity = {
            conversation: {
              id: settings.conversationId,
            },
          };
        }
      }
    } else {
      finalLocale = sourceInput.locale;
      text = (sourceInput.utterance ||
        sourceInput.message ||
        sourceInput.text) as string | undefined;
    }
    if (!context) {
      context = await this.contextManager.getContext(sourceInput);
    }
    context.channel = sourceInput.channel as string;
    context.app = sourceInput.app as string;
    context.from = sourceInput.from || null;
    const input = {
      locale: finalLocale,
      utterance: text,
      context,
      settings: this.applySettings(settings, this.settings.nlu),
    };
    const forceNER =
      input.settings && 'forceNER' in input.settings
        ? input.settings.forceNER
        : this.forceNER;
    let output: NlpResult = await this.nluManager.process(input);
    if (forceNER || !this.slotManager.isEmpty) {
      const optionalUtterance = await this.ner.generateEntityUtterance(
        output.locale || finalLocale,
        text
      );
      if (optionalUtterance && optionalUtterance !== text) {
        const optionalInput = {
          locale: output.locale || finalLocale,
          utterance: optionalUtterance,
          context,
          settings: this.applySettings(settings, this.settings.nlu),
        };
        const optionalOutput: NlpResult =
          await this.nluManager.process(optionalInput);
        if (
          optionalOutput &&
          (optionalOutput.score > output.score || output.intent === 'None')
        ) {
          output = optionalOutput;
          output.utterance = text;
          output.optionalUtterance = optionalUtterance;
        }
      }
    }
    if (output.score < this.settings.threshold) {
      output.score = 1;
      output.intent = 'None';
    }
    output.context = context;
    if (forceNER || !this.slotManager.isEmpty) {
      const intentEntities = this.slotManager.getIntentEntityNames(
        output.intent
      );
      output = (await this.ner.process(
        { ...output } as NerInput,
        intentEntities
      )) as NlpResult;
    } else {
      output.entities = [];
      output.sourceEntities = [];
    }
    const stemmer = this.container.get<FillingStemmer>(
      `stemmer-${output.locale}`
    );
    if (stemmer && stemmer.lastFill) {
      stemmer.lastFill(output);
    }
    output = this.structureEntities(output);
    if (forceNER || !this.slotManager.isEmpty) {
      if (this.slotManager.process(output as SlotFillingResult, context)) {
        // structure entities again because slots may have added
        output = this.structureEntities(output);
      }
      context.slotFill = output.slotFill;
    }
    if (this.settings.executeActionsBeforeAnswers) {
      output = (await this.actionManager.run({
        ...output,
      } as NlgInput)) as NlpResult;
    }
    if (this.settings.executeActionsBeforeAnswers && output.answer) {
      // Render answer from actions and use as final answer
      output.answer = this.nlgManager.renderText(output.answer, context);
    } else {
      const answers = (await this.nlgManager.run({
        ...output,
      } as NlgInput)) as NlgInput;
      output.answers = answers.answers;
      output.answer = answers.answer;
    }
    if (output.srcAnswer) {
      // Re-Render Answer to also replace newly added entities in srcAnswer
      output.answer = this.nlgManager.renderText(output.srcAnswer, context);
    }
    if (!this.settings.executeActionsBeforeAnswers) {
      output = (await this.actionManager.run({
        ...output,
      } as NlgInput)) as NlpResult;
    }
    if (this.settings.calculateSentiment) {
      const sentiment = await this.getSentiment(finalLocale, text);
      output.sentiment = sentiment ? sentiment.sentiment : undefined;
    }
    await this.contextManager.setContext(sourceInput, context);
    delete output.context;
    delete output.settings;
    const result = sourceInput
      ? this.applySettings(sourceInput, output)
      : output;
    if (result.intent === 'None' && !result.answer) {
      const openQuestion =
        this.container.get<OpenQuestionService>('open-question');
      if (openQuestion) {
        const qnaAnswer = await openQuestion.getAnswer(
          result.locale,
          result.utterance
        );
        if (qnaAnswer && qnaAnswer.answer && qnaAnswer.answer.length > 0) {
          result.answer = qnaAnswer.answer;
          result.isOpenQuestionAnswer = true;
          result.openQuestionFirstCharacter = qnaAnswer.position;
          result.openQuestionScore = qnaAnswer.score;
        }
      }
    }
    if (this.onIntent) {
      await this.onIntent(this, result);
    } else {
      const eventName = `onIntent(${result.intent})`;
      const pipeline = this.container.getPipeline(eventName);
      if (pipeline) {
        await this.container.runPipeline(pipeline, result, this);
      }
    }
    return result;
  }

  toJSON(): NlpJson {
    const result: NlpJson = {
      settings: { ...this.settings },
      nluManager: this.nluManager.toJSON(),
      ner: this.ner.toJSON(),
      nlgManager: this.nlgManager.toJSON(),
      actionManager: this.actionManager.toJSON(),
      slotManager: this.slotManager.save(),
    };
    delete result.settings.container;

    return result;
  }

  fromJSON(json: NlpJson): void {
    this.applySettings(this.settings, json.settings);
    this.nluManager.fromJSON(json.nluManager);
    this.ner.fromJSON(json.ner);
    this.nlgManager.fromJSON(json.nlgManager);
    this.actionManager.fromJSON(json.actionManager);
    this.slotManager.load(json.slotManager);
  }

  export(minified = false): string {
    const clone = this.toJSON();
    return minified ? JSON.stringify(clone) : JSON.stringify(clone, null, 2);
  }

  import(data: string | NlpJson): void {
    const clone = typeof data === 'string' ? JSON.parse(data) : data;
    this.fromJSON(clone);
  }

  async save(srcFileName?: string, minified = false): Promise<void> {
    const fs = this.container.get<{
      writeFile(name: string, data: string): Promise<void>;
    }>('fs');
    const fileName = srcFileName || 'model.nlp';
    await fs.writeFile(fileName, this.export(minified));
  }

  async load(srcFileName?: string): Promise<boolean> {
    const fs = this.container.get<{
      readFile(name: string): Promise<string>;
    }>('fs');
    const fileName = srcFileName || 'model.nlp';
    const data = await fs.readFile(fileName);
    if (data) {
      this.import(data);
      return true;
    }
    return false;
  }
}

export default Nlp;
