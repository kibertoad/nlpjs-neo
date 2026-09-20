import { defaultContainer, type Container } from './container.js';
import type {
  ContainerHolder,
  NormalizeFlag,
  NormalizerService,
  PipelineInput,
} from './types.js';

class Normalizer implements NormalizerService {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'normalize';
  }

  normalize(text: string, _input?: NormalizeFlag): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  run(srcInput: PipelineInput): PipelineInput {
    const input = srcInput;
    const locale = input.locale || 'en';
    const normalizer =
      this.container.get<NormalizerService>(`normalizer-${locale}`) || this;
    input.text = normalizer.normalize(input.text as string, input);
    return input;
  }
}

export default Normalizer;
