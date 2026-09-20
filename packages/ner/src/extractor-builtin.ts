import { defaultContainer } from '@nlpjs-neo/core';
import type { Container, ContainerHolder } from '@nlpjs-neo/core';
import reduceEdges from './reduce-edges.js';
import type { Extractor, NerInput } from './types.js';

/**
 * Entry point of the builtin extractors. It holds no rules of its own: it
 * resolves the extractor registered for the locale -- Duckling, the Microsoft
 * recognizers, the default one -- and merges what it found into the input.
 */
class ExtractorBuiltin implements Extractor {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container =
      (container as { container?: Container }).container ||
      (container as Container);
    this.name = 'extract-builtin';
  }

  extract(srcInput: NerInput): NerInput {
    return srcInput;
  }

  async run(srcInput: NerInput): Promise<NerInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor =
      this.container.get<Extractor>(`extract-builtin-${locale}`) || this;
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
