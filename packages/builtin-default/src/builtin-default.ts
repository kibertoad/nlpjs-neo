import { Clonable, defaultContainer } from '@nlpjs-neo/core';
import type { Container, Locale } from '@nlpjs-neo/core';
import Recognizers from './recognizers.js';
import type {
  BuiltinDefaultSettings,
  BuiltinEdge,
  BuiltinInput,
  Recognizer,
} from './types.js';

/** An extractor registered for a locale, which this one defers to. */
interface LocaleExtractor {
  extract(input: BuiltinInput): BuiltinInput | Promise<BuiltinInput>;
}

class BuiltinDefault extends Clonable {
  declare settings: BuiltinDefaultSettings;

  constructor(
    settings: BuiltinDefaultSettings = {},
    container: Container = defaultContainer
  ) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = 'builtin-default';
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
  }

  registerDefault(): void {
    this.container.registerConfiguration('builtin-default', {
      builtins: [
        'Email',
        'URL',
        'IpAddress',
        'PhoneNumber',
        'Hashtag',
        'Number',
        'Date',
      ],
    });
  }

  /** Drops an edge another one of the same span and entity already covers. */
  prereduceEdges(edges: BuiltinEdge[]): BuiltinEdge[] {
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (!edge.discarded) {
        for (let j = i + 1; j < edges.length; j += 1) {
          const other = edges[j];
          if (!other.discarded) {
            if (
              other.start === edge.start &&
              other.end === edge.end &&
              other.entity === edge.entity &&
              other.accuracy <= edge.accuracy
            ) {
              other.discarded = true;
            }
          }
        }
      }
    }
    return edges.filter((x) => !x.discarded);
  }

  findBuiltinEntities(
    utterance: string,
    locale?: Locale,
    srcBuiltins?: string[]
  ): { edges: BuiltinEdge[] } {
    const result: BuiltinEdge[] = [];
    const builtins = srcBuiltins || this.settings.builtins;
    builtins.forEach((name) => {
      // Recognizers are looked up by the name of the builtin, so the table
      // is read as the map of recognizers it is for that purpose.
      const recognize = (Recognizers as unknown as Record<string, Recognizer>)[
        `recognize${name}`
      ];
      const entities = recognize(utterance, locale || 'en');
      for (let i = 0; i < entities.length; i += 1) {
        const entity = entities[i];
        result.push(entity);
      }
    });
    const reducedResult = this.prereduceEdges(result);
    return {
      edges: reducedResult,
    };
  }

  extract(srcInput: BuiltinInput): BuiltinInput {
    const input = srcInput;
    const entities = this.findBuiltinEntities(
      input.text || input.utterance,
      input.locale,
      input.builtins
    );
    if (!input.edges) {
      input.edges = [];
    }
    for (let i = 0; i < entities.edges.length; i += 1) {
      input.edges.push(entities.edges[i]);
    }
    return input;
  }

  run(srcInput: BuiltinInput): BuiltinInput | Promise<BuiltinInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor =
      this.container.get<LocaleExtractor>(`extract-builtin-${locale}`) || this;
    return extractor.extract(input);
  }
}

export default BuiltinDefault;
