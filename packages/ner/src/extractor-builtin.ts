import { defaultContainer } from '@nlpjs-neo/core';
import reduceEdges from './reduce-edges.js';

class ExtractorBuiltin {
  declare container: any;
  declare name: any;

  constructor(container = defaultContainer) {
    this.container = container.container || container;
    this.name = 'extract-builtin';
  }

  extract(srcInput) {
    return srcInput;
  }

  async run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor = this.container.get(`extract-builtin-${locale}`) || this;
    const newInput = await extractor.extract({
      text: input.text || input.utterance,
      locale: input.locale,
    });
    input.edges = input.edges || [];
    if (newInput.edges) {
      for (let i = 0; i < newInput.edges.length; i += 1) {
        if (
          !input.nerLimitToEntities ||
          input.intentEntities.includes(newInput.edges[i].entity)
        ) {
          input.edges.push(newInput.edges[i]);
        }
      }
    }
    input.edges = reduceEdges(input.edges, false);
    input.sourceEntities = input.sourceEntities || [];
    if (newInput.sourceEntities) {
      for (let i = 0; i < newInput.sourceEntities.length; i += 1) {
        input.sourceEntities.push(newInput.sourceEntities[i]);
      }
    }
    return input;
  }
}

export default ExtractorBuiltin;
