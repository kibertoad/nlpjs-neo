import { Clonable } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Locale,
  RegisteredPipeline,
} from '@nlpjs-neo/core';
import ExtractorEnum from './extractor-enum.js';
import ExtractorRegex from './extractor-regex.js';
import ExtractorTrim from './extractor-trim.js';
import ExtractorBuiltin from './extractor-builtin.js';

import { TrimType } from './trim-types.js';
import type {
  BetweenTrimRule,
  Edge,
  EntityName,
  EnumRuleOption,
  Extractor,
  NerInput,
  NerJson,
  NerSettings,
  PositionTrimRule,
  Rule,
  RuleCondition,
  RulesByLocale,
  RuleType,
  TrimOptions,
  TrimTypeValue,
} from './types.js';

/** The four extractors, resolved from the container once and kept. */
interface ExtractorCache {
  extractEnum: Extractor | undefined;
  extractRegex: Extractor | undefined;
  extractTrim: Extractor | undefined;
  extractBuiltin: Extractor | undefined;
}

function isObject(obj: unknown): boolean {
  return obj !== undefined && obj !== null && obj.constructor === Object;
}

class Ner extends Clonable {
  declare cache: ExtractorCache | undefined;
  declare pipelineProcess: RegisteredPipeline | undefined;
  /** Every rule this was taught, by locale and then by entity name. */
  declare rules: RulesByLocale;
  declare settings: NerSettings;

  constructor(settings: NerSettings = {}, container?: ContainerHolder) {
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
    this.applySettings(this.settings);
    if (!this.settings.tag) {
      this.settings.tag = `ner`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.rules = {};
    this.applySettings(this, {
      pipelineProcess: this.getPipeline(`${this.settings.tag}-process`),
    });
  }

  registerDefault(): void {}

  getRulesByName(locale = '*', name = '', force = false): Rule | undefined {
    if (!this.rules[locale]) {
      if (!force) {
        return undefined;
      }
      this.rules[locale] = {};
    }
    if (!this.rules[locale][name]) {
      if (!force) {
        return undefined;
      }
      this.rules[locale][name] = {
        name,
        type: 'enum',
        rules: [],
      };
    }
    return this.rules[locale][name];
  }

  addRule(
    locale: Locale | Locale[] = '*',
    name: EntityName,
    type: RuleType,
    rule: RuleCondition
  ): void {
    if (Array.isArray(locale)) {
      for (let i = 0; i < locale.length; i += 1) {
        this.addRule(locale[i], name, type, rule);
      }
    } else {
      if (!this.rules[locale]) {
        this.rules[locale] = {};
      }
      if (!this.rules[locale][name]) {
        this.rules[locale][name] = {
          name,
          type,
          rules: [],
        };
      }
      this.rules[locale][name].rules.push(rule);
    }
  }

  asString(item: unknown): string {
    if (item) {
      if (isObject(item)) {
        return JSON.stringify(item);
      }
      if (item.toString) {
        return item.toString();
      }
    }
    return '';
  }

  findRule(rules: RuleCondition[], rule: RuleCondition): number {
    const str = this.asString(rule);
    for (let i = 0; i < rules.length; i += 1) {
      if (this.asString(rules[i]) === str) {
        return i;
      }
    }
    return -1;
  }

  removeRule(
    locale: Locale = '*',
    name: EntityName,
    rule?: RuleCondition
  ): void {
    if (this.rules[locale]) {
      if (this.rules[locale][name]) {
        if (!rule) {
          delete this.rules[locale][name];
        } else {
          const index = this.findRule(this.rules[locale][name].rules, rule);
          if (index > -1) {
            this.rules[locale][name].rules.splice(index, 1);
          }
        }
      }
    }
  }

  /** Rules of a locale, followed by the ones taught for every locale. */
  getRules(locale: Locale = '*'): Rule[] {
    const result: Rule[] = [];
    if (this.rules[locale]) {
      const keys = Object.keys(this.rules[locale]);
      for (let i = 0; i < keys.length; i += 1) {
        result.push(this.rules[locale][keys[i]]);
      }
    }
    if (locale !== '*' && this.rules['*']) {
      const keys = Object.keys(this.rules['*']);
      for (let i = 0; i < keys.length; i += 1) {
        result.push(this.rules['*'][keys[i]]);
      }
    }
    return result;
  }

  /**
   * Chooses the rules an utterance is extracted with. Entities the recognized
   * intent is trained with go first, so an overlap is resolved in their
   * favour, or are the only ones kept when the settings say so.
   */
  decideRules(srcInput: NerInput, intentEntities?: EntityName[]): NerInput {
    const input = srcInput;
    let nerRules = this.getRules(input.locale || 'en');
    if (intentEntities && this.settings.considerOnlyIntentEntities) {
      nerRules = nerRules.filter((rule) => intentEntities.includes(rule.name));
    } else if (intentEntities) {
      // entities in the current intent get a higher priority when
      // sorting out overlapping matches
      const intentRelevantRule: Rule[] = [];
      const nonIntentRelevantRule: Rule[] = [];
      nerRules.forEach((rule) => {
        if (intentEntities.includes(rule.name)) {
          intentRelevantRule.push(rule);
        } else {
          nonIntentRelevantRule.push(rule);
        }
      });
      nerRules = intentRelevantRule.concat(nonIntentRelevantRule);
    }
    input.nerRules = nerRules;
    input.nerLimitToEntities = this.settings.considerOnlyIntentEntities;
    input.intentEntities = intentEntities;
    return input;
  }

  getRuleOption(
    rules: RuleCondition[],
    option: string
  ): EnumRuleOption | undefined {
    for (let i = 0; i < rules.length; i += 1) {
      if ((rules[i] as EnumRuleOption).option === option) {
        return rules[i] as EnumRuleOption;
      }
    }
    return undefined;
  }

  addRuleOptionTexts(
    locale: Locale | Locale[],
    name: EntityName,
    option: string,
    srcTexts?: string | string[]
  ): void {
    if (Array.isArray(locale)) {
      for (let i = 0; i < locale.length; i += 1) {
        this.addRuleOptionTexts(locale[i], name, option, srcTexts);
      }
    } else {
      let texts = srcTexts || option;
      if (!Array.isArray(texts)) {
        texts = [texts];
      }
      const rules = this.getRulesByName(locale, name, true);
      let ruleOption = this.getRuleOption(rules.rules, option);
      if (!ruleOption) {
        ruleOption = {
          option,
          texts,
        };
        rules.rules.push(ruleOption);
      } else {
        const dict: Record<string, 1> = {};
        for (let i = 0; i < ruleOption.texts.length; i += 1) {
          dict[ruleOption.texts[i]] = 1;
        }
        for (let i = 0; i < texts.length; i += 1) {
          dict[texts[i]] = 1;
        }
        ruleOption.texts = Object.keys(dict);
      }
    }
  }

  removeRuleOptionTexts(
    locale: Locale | Locale[],
    name: EntityName,
    option: string,
    srcTexts?: string | string[]
  ): void {
    if (Array.isArray(locale)) {
      for (let i = 0; i < locale.length; i += 1) {
        this.removeRuleOptionTexts(locale[i], name, option, srcTexts);
      }
    } else {
      let texts = srcTexts || option;
      if (!Array.isArray(texts)) {
        texts = [texts];
      }
      const rules = this.getRulesByName(locale, name, false);
      if (rules) {
        const ruleOption = this.getRuleOption(rules.rules, option);
        if (ruleOption) {
          const dict: Record<string, 1> = {};
          for (let i = 0; i < ruleOption.texts.length; i += 1) {
            dict[ruleOption.texts[i]] = 1;
          }
          for (let i = 0; i < texts.length; i += 1) {
            delete dict[texts[i]];
          }
          ruleOption.texts = Object.keys(dict);
        }
      }
    }
  }

  static str2regex(str: string): RegExp {
    const index = str.lastIndexOf('/');
    return new RegExp(str.slice(1, index), str.slice(index + 1));
  }

  static regex2str(regex: RegExp): string {
    return regex.toString();
  }

  addRegexRule(
    locale: Locale | Locale[],
    name: EntityName,
    srcRegex: string | RegExp
  ): void {
    const regex =
      typeof srcRegex === 'string' ? Ner.str2regex(srcRegex) : srcRegex;
    const globalFlag = 'g';
    const fixedRegex = regex.flags.includes(globalFlag)
      ? regex
      : new RegExp(regex.source, `${regex.flags}${globalFlag}`);
    this.addRule(locale, name, 'regex', fixedRegex);
  }

  addBetweenLastCondition(
    locale: Locale | Locale[],
    name: EntityName,
    srcLeftWords: string | string[],
    srcRightWords: string | string[],
    srcOptions: TrimOptions = {}
  ): void {
    const options = {
      ...srcOptions,
      closest: true,
    };
    this.addBetweenCondition(
      locale,
      name,
      srcLeftWords,
      srcRightWords,
      options
    );
  }

  addBetweenCondition(
    locale: Locale | Locale[],
    name: EntityName,
    srcLeftWords: string | string[],
    srcRightWords: string | string[],
    srcOptions?: TrimOptions
  ): void {
    const options = srcOptions || {};
    const leftWords = Array.isArray(srcLeftWords)
      ? srcLeftWords
      : [srcLeftWords];
    const rightWords = Array.isArray(srcRightWords)
      ? srcRightWords
      : [srcRightWords];
    const conditions: string[] = [];
    for (let i = 0; i < leftWords.length; i += 1) {
      for (let j = 0; j < rightWords.length; j += 1) {
        const leftWord =
          options.noSpaces === true ? leftWords[i] : ` ${leftWords[i]} `;
        const rightWord =
          options.noSpaces === true ? rightWords[j] : ` ${rightWords[j]} `;
        let regex: string;
        if (options.closest === true) {
          regex = `${leftWord}(?!.*${leftWord}.*)(.*)${rightWord}`;
        } else {
          regex = `(?<=${leftWord})(.*)(?=${rightWord})`;
        }
        conditions.push(regex);
      }
    }
    let regex = `/${conditions.join('|')}/g`;
    if (options.caseSensitive !== true) {
      regex += 'i';
    }
    const rule: BetweenTrimRule = {
      type: 'between',
      leftWords,
      rightWords,
      regex: Ner.str2regex(regex),
      options,
    };
    this.addRule(locale, name, 'trim', rule);
  }

  addPositionCondition(
    locale: Locale | Locale[],
    name: EntityName,
    position: TrimTypeValue,
    srcWords: string | string[],
    srcOptions?: TrimOptions
  ): void {
    const options = srcOptions || {};
    const words = Array.isArray(srcWords) ? srcWords : [srcWords];
    const rule: PositionTrimRule = {
      type: position,
      words,
      options,
    };
    this.addRule(locale, name, 'trim', rule);
  }

  addAfterCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.After, words, opts);
  }

  addAfterFirstCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.AfterFirst, words, opts);
  }

  addAfterLastCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.AfterLast, words, opts);
  }

  addBeforeCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.Before, words, opts);
  }

  addBeforeFirstCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.BeforeFirst, words, opts);
  }

  addBeforeLastCondition(locale, name, words, opts?) {
    this.addPositionCondition(locale, name, TrimType.BeforeLast, words, opts);
  }

  reduceEdges(input: NerInput): NerInput {
    input.entities = input.edges;
    delete input.edges;
    delete input.nerRules;
    delete input.nerLimitToEntities;
    delete input.intentEntities;
    return input;
  }

  async defaultPipelineProcess(
    input: NerInput,
    intentEntities?: EntityName[]
  ): Promise<NerInput> {
    if (!this.cache) {
      this.cache = {
        extractEnum: this.container.get<Extractor>('extract-enum'),
        extractRegex: this.container.get<Extractor>('extract-regex'),
        extractTrim: this.container.get<Extractor>('extract-trim'),
        extractBuiltin: this.container.get<Extractor>('extract-builtin'),
      };
      if (!this.cache.extractEnum) {
        this.container.use(ExtractorEnum);
        this.cache.extractEnum = this.container.get<Extractor>('extract-enum');
      }
      if (!this.cache.extractRegex) {
        this.container.use(ExtractorRegex);
        this.cache.extractRegex =
          this.container.get<Extractor>('extract-regex');
      }
      if (!this.cache.extractTrim) {
        this.container.use(ExtractorTrim);
        this.cache.extractTrim = this.container.get<Extractor>('extract-trim');
      }
      if (!this.cache.extractBuiltin) {
        this.container.use(ExtractorBuiltin);
        this.cache.extractBuiltin =
          this.container.get<Extractor>('extract-builtin');
      }
    }
    let output = await this.decideRules(input, intentEntities);
    if (this.cache.extractEnum) {
      output = await this.cache.extractEnum.run(output);
    }
    if (this.cache.extractRegex) {
      output = await this.cache.extractRegex.run(output);
    }
    if (this.cache.extractTrim) {
      output = await this.cache.extractTrim.run(output);
    }
    if (this.cache.extractBuiltin) {
      output = await this.cache.extractBuiltin.run(output);
    }
    output = await this.reduceEdges(output);
    return output;
  }

  async process(
    srcInput: NerInput,
    consideredEntities?: EntityName[],
    _utterance?: unknown,
    _arg3?: unknown
  ): Promise<NerInput> {
    const input: NerInput = {
      threshold: this.settings.threshold || 0.8,
      ...srcInput,
    };
    let result: NerInput | undefined;
    if (input.locale) {
      const pipeline = this.container.getPipeline(
        `${this.settings.tag}-${input.locale}-process`
      );
      if (pipeline) {
        result = await this.runPipeline(input, pipeline);
      }
    } else if (this.pipelineProcess) {
      result = await this.runPipeline(input, this.pipelineProcess);
    }
    if (!result) {
      result = await this.defaultPipelineProcess(input, consideredEntities);
    } else if (consideredEntities) {
      // when custom pipeline is used then we can not be sure it is handled correctly
      result.entities = result.entities.filter((entity) =>
        consideredEntities.includes(entity.entity)
      );
    }
    delete result.threshold;
    return result;
  }

  nameToEntity(name: EntityName): string {
    const preffix =
      this.settings.entityPreffix === undefined
        ? '@'
        : this.settings.entityPreffix;
    const suffix =
      this.settings.entitySuffix === undefined
        ? ''
        : this.settings.entitySuffix;
    return `${preffix}${name}${suffix}`;
  }

  entityToName(entity: string): string {
    if (!entity) {
      return entity;
    }
    let name = entity;
    const preffix =
      this.settings.entityPreffix === undefined
        ? '@'
        : this.settings.entityPreffix;
    const suffix =
      this.settings.entitySuffix === undefined
        ? ''
        : this.settings.entitySuffix;
    if (preffix) {
      if (!name.startsWith(preffix)) {
        return entity;
      }
      name = name.slice(preffix.length);
    }
    if (suffix) {
      if (!name.endsWith(suffix)) {
        return entity;
      }
      name = name.slice(0, -suffix.length);
    }
    return name;
  }

  isEntity(entity: string): boolean {
    const name = this.entityToName(entity);
    return name !== entity;
  }

  /** The entities an utterance refers to by name, such as `@hero`. */
  getEntitiesFromUtterance(locale: Locale, utterance?: string): EntityName[] {
    if (!utterance) {
      utterance = locale;
      locale = 'es';
    }
    const tokens = utterance.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
    const result: EntityName[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (this.isEntity(token)) {
        result.push(this.entityToName(token));
      }
    }
    return result;
  }

  /** Rewrites the entities an utterance holds as their names. */
  async generateEntityUtterance(
    locale: Locale,
    utterance: string
  ): Promise<string> {
    let input: NerInput = {
      locale,
      utterance,
    };
    input = await this.process(input);
    const entities = input.entities as Edge[];
    if (!entities || !entities.length) {
      return utterance;
    }
    entities.sort((a, b) => a.start - b.start);
    let index = 0;
    let result = '';
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      const left = utterance.slice(index, entity.start);
      index = entity.end + 1;
      result += left;
      result += this.nameToEntity(entity.entity);
    }
    const right = utterance.slice(entities[entities.length - 1].end + 1);
    result += right;
    return result;
  }

  toJSON(): NerJson {
    // easy RegExp serialization: https://stackoverflow.com/questions/12075927/serialization-of-regexp
    // oxlint-disable-next-line no-extend-native
    (RegExp.prototype as { toJSON?: () => string }).toJSON =
      RegExp.prototype.toString;

    const result: NerJson = {
      settings: { ...this.settings },
      rules: { ...this.rules },
    };

    delete result.settings.container;
    return result;
  }

  fromJSON(json: NerJson): void {
    this.applySettings(this.settings, json.settings);

    const rulesKeys = Object.keys(json.rules);

    rulesKeys.forEach((rKey) => {
      const entityKeys = Object.keys(json.rules[rKey]);

      entityKeys.forEach((eKey) => {
        json.rules[rKey][eKey].rules =
          json.rules[rKey][eKey].type === 'regex'
            ? json.rules[rKey][eKey].rules.map((rule) =>
                Ner.str2regex(rule as unknown as string)
              )
            : json.rules[rKey][eKey].rules.map((rule) => {
                const trim = rule as { regex?: string | RegExp };
                return typeof trim.regex === 'string'
                  ? {
                      ...rule,
                      regex: Ner.str2regex(trim.regex),
                    }
                  : rule;
              });
      });
    });

    this.rules = json.rules;
  }
}

export default Ner;
