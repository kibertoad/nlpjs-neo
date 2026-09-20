import { Normalizer } from '@nlpjs-neo/core';
import type { ContainerHolder, PipelineInput } from '@nlpjs-neo/core';

class NormalizerKo extends Normalizer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'normalizer-ko';
  }

  normalize(text: string, _input?: PipelineInput): string {
    return text.replace(/까?/g, '').toLowerCase();
  }

  run(srcInput: PipelineInput): PipelineInput {
    const input = srcInput;
    input.text = this.normalize(input.text, input);
    return input;
  }
}

export default NormalizerKo;
