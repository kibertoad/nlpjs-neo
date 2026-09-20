import { Clonable } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Locale,
  RegisteredPipeline,
} from '@nlpjs-neo/core';
import { Language } from '@nlpjs-neo/language-min';
import DomainManager from './domain-manager.js';
import type {
  Classification,
  Domain,
  DomainClassification,
  DomainManagerSettings,
  Intent,
  NluManagerInput,
  NluManagerJson,
  NluManagerSettings,
} from './types.js';

class NluManager extends Clonable {
  /** One domain manager per locale this manager was taught. */
  declare domainManagers: Record<Locale, DomainManager>;
  /** Language guesser, used when an utterance arrives without a locale. */
  declare guesser: Language;
  /** Domain each intent belongs to, per locale. */
  declare intentDomains: Record<Locale, Record<Intent, Domain>>;
  /** Display name of a locale, when one was described. */
  declare languageNames: Record<Locale, { locale: Locale; name: string }>;
  declare locales: Locale[];
  declare pipelineProcess: RegisteredPipeline | undefined;
  declare pipelineTrain: RegisteredPipeline | undefined;
  declare settings: NluManagerSettings;

  constructor(settings: NluManagerSettings = {}, container?: ContainerHolder) {
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
    if (!this.settings.tag) {
      this.settings.tag = 'nlu-manager';
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    if (!this.container.get('Language')) {
      this.container.register('Language', Language, false);
    }
    this.guesser = this.container.get<Language>('Language');
    this.locales = [];
    this.languageNames = {};
    this.domainManagers = {};
    this.intentDomains = {};
    if (this.settings.locales) {
      this.addLanguage(this.settings.locales);
    }
    this.applySettings(this, {
      pipelineTrain: this.getPipeline(`${this.settings.tag}-train`),
      pipelineProcess: this.getPipeline(`${this.settings.tag}-process`),
    });
  }

  registerDefault(): void {
    this.container.registerConfiguration('nlu-manager', {}, false);
    this.container.registerPipeline(
      'nlu-manager-train',
      ['.innerTrain'],
      false
    );
  }

  describeLanguage(locale: Locale, name: string): void {
    this.languageNames[locale] = { locale, name };
  }

  addLanguage(srcLocales: Locale | Locale[] | undefined): void {
    if (srcLocales) {
      const locales = Array.isArray(srcLocales) ? srcLocales : [srcLocales];
      for (let i = 0; i < locales.length; i += 1) {
        const locale = locales[i].substr(0, 2).toLowerCase();
        if (!this.locales.includes(locale)) {
          this.locales.push(locale);
        }
        if (!this.domainManagers[locale]) {
          this.domainManagers[locale] = new DomainManager(
            {
              locale,
              ...this.settings.domain,
              useNoneFeature: this.settings.useNoneFeature,
              trainByDomain: this.settings.trainByDomain,
            },
            this.container
          );
        }
      }
    }
  }

  removeLanguage(locales: Locale | Locale[]): void {
    if (Array.isArray(locales)) {
      locales.forEach((locale) => this.removeLanguage(locale));
    } else {
      delete this.domainManagers[locales];
      const index = this.locales.indexOf(locales);
      if (index !== -1) {
        this.locales.splice(index, 1);
      }
    }
  }

  /**
   * Fills in the locale of an input, or answers the locale of a text. With a
   * single language taught, that language is the answer.
   */
  guessLanguage(
    srcInput: string | NluManagerInput | undefined
  ): Locale | NluManagerInput | undefined {
    const input = srcInput;
    const isString = typeof input === 'string';
    if (this.locales.length === 1) {
      if (isString) {
        return this.locales[0];
      }
      [input.locale] = this.locales;
      return input;
    }
    if (!input) {
      return isString ? undefined : input;
    }
    if (!isString && input.locale) {
      return input;
    }
    const utterance = isString ? input : input.utterance;
    if (this.locales.length === 1) {
      if (isString) {
        return this.locales[0];
      }
      [input.locale] = this.locales;
    }
    const guess = this.guesser.guess(utterance, this.locales, 1);
    const locale = guess && guess.length > 0 ? guess[0].alpha2 : undefined;
    if (isString) {
      return locale;
    }
    input.locale = locale;
    return input;
  }

  assignDomain(srcLocale: string, srcIntent: string, srcDomain?: Domain): void {
    const locale = srcDomain ? srcLocale.substr(0, 2).toLowerCase() : undefined;
    const intent = srcDomain ? srcIntent : srcLocale;
    const domain = srcDomain || srcIntent;
    if (locale) {
      if (!this.intentDomains[locale]) {
        this.intentDomains[locale] = {};
      }
      this.intentDomains[locale][intent] = domain;
    } else {
      for (let i = 0; i < this.locales.length; i += 1) {
        this.assignDomain(this.locales[i], intent, domain);
      }
    }
  }

  getIntentDomain(srcLocale: Locale, intent: Intent): Domain {
    const locale = srcLocale.substr(0, 2).toLowerCase();
    if (!this.intentDomains[locale]) {
      return 'default';
    }
    return this.intentDomains[locale][intent] || 'default';
  }

  /** Intents grouped by domain, per locale. */
  getDomains(): Record<Locale, Record<Domain, Intent[]>> {
    const result: Record<Locale, Record<Domain, Intent[]>> = {};
    const locales = Object.keys(this.intentDomains);
    for (let i = 0; i < locales.length; i += 1) {
      const locale = locales[i];
      result[locale] = {};
      const intents = Object.keys(this.intentDomains[locale]);
      for (let j = 0; j < intents.length; j += 1) {
        const intent = intents[j];
        const domain = this.intentDomains[locale][intent];
        if (!result[locale][domain]) {
          result[locale][domain] = [];
        }
        result[locale][domain].push(intent);
      }
    }
    return result;
  }

  consolidateLocale(srcLocale: Locale | undefined, utterance: string): Locale {
    // A text in, so the guess is a locale rather than a filled in input.
    const locale = srcLocale
      ? srcLocale.substr(0, 2).toLowerCase()
      : (this.guessLanguage(utterance) as Locale | undefined);
    if (!locale) {
      throw new Error('Locale must be defined');
    }
    return locale;
  }

  consolidateManager(locale: Locale): DomainManager {
    const manager = this.domainManagers[locale];
    if (!manager) {
      throw new Error(`Domain Manager not found for locale ${locale}`);
    }
    return manager;
  }

  add(srcLocale: Locale, utterance: string, intent?: Intent): void {
    const locale = this.consolidateLocale(srcLocale, utterance);
    const manager = this.consolidateManager(locale);
    const domain = this.getIntentDomain(locale, intent);
    this.guesser.addExtraSentence(locale, utterance);
    manager.add(domain, utterance, intent);
  }

  remove(srcLocale: Locale, utterance: string, intent?: Intent): void {
    const locale = this.consolidateLocale(srcLocale, utterance);
    const manager = this.consolidateManager(locale);
    const domain = this.getIntentDomain(locale, intent);
    manager.remove(domain, utterance, intent);
  }

  async innerTrain(settings: NluManagerInput): Promise<unknown[]> {
    let locales =
      (settings.settings ? settings.settings.locales : undefined) ||
      this.locales;
    if (!Array.isArray(locales)) {
      locales = [locales];
    }
    const promises = locales
      .filter((locale) => this.domainManagers[locale])
      .map((locale) =>
        this.domainManagers[locale].train(
          settings.settings as DomainManagerSettings
        )
      );
    return Promise.all(promises);
  }

  async train(settings?: NluManagerSettings): Promise<unknown> {
    const input = {
      nluManager: this,
      settings: this.applySettings(settings, this.settings),
    };
    delete input.settings.tag;
    return this.runPipeline(input, this.pipelineTrain);
  }

  /** Resolves the locale of an input and the display name of its language. */
  fillLanguage(srcInput: NluManagerInput): NluManagerInput {
    const input = srcInput;
    input.languageGuessed = false;
    if (!input.locale) {
      input.locale = this.guessLanguage(input.utterance) as Locale;
      input.languageGuessed = true;
    }
    if (input.locale) {
      input.localeIso2 = input.locale.substr(0, 2).toLowerCase();
      input.language = (
        this.languageNames[input.localeIso2] ||
        this.guesser.languagesAlpha2[input.localeIso2] ||
        {}
      ).name;
    }
    return input;
  }

  /** `true` when the answer does not single out one intent. */
  classificationsIsNone(classifications: Classification[]): boolean {
    if (classifications.length === 1) {
      return false;
    }
    if (classifications.length === 0 || classifications[0].score === 0) {
      return true;
    }
    return classifications[0].score === classifications[1].score;
  }

  checkIfIsNone(srcInput: NluManagerInput): NluManagerInput {
    const input = srcInput;
    if (this.classificationsIsNone(input.classifications)) {
      input.intent = 'None';
      input.score = 1;
    }
    return input;
  }

  async innerClassify(srcInput: NluManagerInput): Promise<NluManagerInput> {
    const input = srcInput;
    const domain = this.domainManagers[input.localeIso2];
    if (!domain) {
      input.classifications = [];
      input.domain = undefined;
      input.intent = undefined;
      input.score = undefined;
      return input;
    }
    const classifications = (await domain.process(
      srcInput
    )) as DomainClassification;
    input.classifications = classifications.classifications.sort(
      (a, b) => b.score - a.score
    );
    if (input.classifications.length === 0) {
      input.classifications.push({ intent: 'None', score: 1 });
    }
    input.intent = input.classifications[0].intent;
    input.score = input.classifications[0].score;
    if (input.intent === 'None') {
      classifications.domain = 'default';
    } else if (classifications.domain === 'default') {
      input.domain = this.getIntentDomain(input.locale, input.intent);
    } else {
      input.domain = classifications.domain;
    }

    return input;
  }

  async defaultPipelineProcess(
    input: NluManagerInput
  ): Promise<NluManagerInput> {
    let output = await this.fillLanguage(input);
    output = await this.innerClassify(output);
    output = await this.checkIfIsNone(output);
    delete output.settings;
    delete output.classification;
    return output;
  }

  process(
    locale: Locale | NluManagerInput,
    utterance?: string,
    domain?: Domain,
    settings?: NluManagerSettings
  ): Promise<NluManagerInput> {
    const input: NluManagerInput =
      typeof locale === 'object'
        ? locale
        : {
            locale: utterance === undefined ? undefined : locale,
            utterance: utterance === undefined ? locale : utterance,
            domain,
            settings: settings || this.settings,
          };
    if (this.pipelineProcess) {
      return this.runPipeline(input, this.pipelineProcess);
    }
    return this.defaultPipelineProcess(input);
  }

  toJSON(): NluManagerJson {
    const result: NluManagerJson = {
      settings: this.settings,
      locales: this.locales,
      languageNames: this.languageNames,
      domainManagers: {},
      intentDomains: this.intentDomains,
      extraSentences: this.guesser.extraSentences.slice(0),
    };
    delete result.settings.container;
    const keys = Object.keys(this.domainManagers);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      result.domainManagers[key] = this.domainManagers[key].toJSON();
    }
    return result;
  }

  fromJSON(json: NluManagerJson): void {
    this.applySettings(this.settings, json.settings);
    for (let i = 0; i < json.locales.length; i += 1) {
      this.addLanguage(json.locales[i]);
    }
    this.languageNames = json.languageNames;
    this.intentDomains = json.intentDomains;

    const keys = Object.keys(json.domainManagers);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      this.domainManagers[key].fromJSON(json.domainManagers[key]);
    }
    for (let i = 0; i < json.extraSentences.length; i += 1) {
      const sentence = json.extraSentences[i];
      this.guesser.addExtraSentence(sentence[0], sentence[1]);
    }
  }
}

export default NluManager;
