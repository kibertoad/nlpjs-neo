import { containerBootstrap } from '@nlpjs-neo/core-loader';
import type { Container } from '@nlpjs-neo/core-loader';
import { LangAll } from '@nlpjs-neo/lang-all';
import { NluNeural } from '@nlpjs-neo/nlu';
import type {
  Classification,
  CorpusEntry,
  NluResult,
  NluSettings,
} from '@nlpjs-neo/nlu';

/** Settings of a `BrainNLU`; `language` is the legacy name of `locale`. */
interface BrainNluSettings extends NluSettings {
  language?: string;
  /** Legacy flag: when set, no classifier is built at all. */
  l?: unknown;
}

class BrainNLU {
  declare container: Container;
  declare corpus: CorpusEntry[];
  declare nlu: NluNeural;
  declare settings: BrainNluSettings;

  constructor(settings: BrainNluSettings = {}) {
    this.settings = settings;
    if (!this.settings.container) {
      this.settings.container = containerBootstrap();
    }
    this.container = this.settings.container;
    this.container.use(LangAll);
    this.nlu = new NluNeural({
      container: this.container,
      locale: this.settings.locale || this.settings.language || 'en',
    });
    this.corpus = [];
  }

  add(utterance: string, intent: string): void {
    if (typeof utterance !== 'string') {
      throw new Error('Utterance must be an string');
    }
    if (typeof intent !== 'string') {
      throw new Error('Intent must be an string');
    }
    this.corpus.push({ utterance, intent });
  }

  train(_arg0?: unknown): Promise<unknown> {
    return this.nlu.train(this.corpus, this.settings);
  }

  async getClassifications(utterance: string): Promise<Classification[]> {
    const result = (await this.nlu.process(utterance)) as NluResult;
    return result.classifications.sort((a, b) => b.score - a.score);
  }

  async getBestClassification(
    utterance: string
  ): Promise<Classification | undefined> {
    const result = await this.getClassifications(utterance);
    return result[0];
  }
}

export default BrainNLU;
