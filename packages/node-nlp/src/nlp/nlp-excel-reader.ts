import { XDoc } from '@nlpjs-neo/xtables';
import type NlpManager from './nlp-manager.js';

/** Reads the tables of a `.xlsx` model into an `NlpManager`. */
class NlpExcelReader {
  declare manager: NlpManager;
  declare xdoc: XDoc;

  constructor(manager: NlpManager) {
    this.manager = manager;
    this.xdoc = new XDoc();
  }

  async load(filename?: string): Promise<void> {
    await this.xdoc.read(filename);
    this.loadSettings();
    this.loadLanguages();
    this.loadNamedEntities();
    this.loadRegexEntities();
    this.loadIntents();
    this.loadResponses();
  }

  loadSettings(): void {}

  loadLanguages(): void {
    this.xdoc.getTable('Languages').data.forEach((row) => {
      this.manager.addLanguage(row.iso2);
    });
  }

  loadNamedEntities(): void {
    this.xdoc.getTable('Named Entities').data.forEach((row) => {
      const languages = (row.language as string)
        .split(',')
        .map((x) => x.trim());
      this.manager.addNamedEntityText(
        row.entity,
        row.option,
        languages,
        row.text
      );
    });
  }

  loadRegexEntities(): void {
    const table = this.xdoc.getTable('Regex Entities');
    if (table) {
      table.data.forEach((row) => {
        const languages = (row.language as string)
          .split(',')
          .map((x) => x.trim());
        this.manager.addRegexEntity(row.entity, languages, row.regex);
      });
    }
  }

  loadIntents(): void {
    this.xdoc.getTable('Intents').data.forEach((row) => {
      this.manager.addDocument(row.language, row.utterance, row.intent);
    });
  }

  loadResponses(): void {
    this.xdoc.getTable('Responses').data.forEach((row) => {
      // The `Responses` table may also carry a `url` column, which no answer
      // has ever stored: `addAnswer` takes the condition as its last argument.
      this.manager.addAnswer(
        row.language,
        row.intent,
        row.response,
        row.condition
      );
    });
  }
}

export default NlpExcelReader;
