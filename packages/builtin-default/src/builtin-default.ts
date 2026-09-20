import { Clonable, defaultContainer } from '@nlpjs-neo/core';
import Recognizers from './recognizers.js';

class BuiltinDefault extends Clonable {
  declare settings: any;

  constructor(settings: any = {}, container = defaultContainer) {
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

  registerDefault() {
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

  prereduceEdges(edges) {
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

  findBuiltinEntities(utterance, locale, srcBuiltins?) {
    const result: any[] = [];
    const builtins = srcBuiltins || this.settings.builtins;
    builtins.forEach((name) => {
      const entities = Recognizers[`recognize${name}`](
        utterance,
        locale || 'en'
      );
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

  extract(srcInput) {
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

  run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor = this.container.get(`extract-builtin-${locale}`) || this;
    return extractor.extract(input);
  }
}

export default BuiltinDefault;
