import { defaultContainer } from './container.js';

class Normalizer {
  declare container: any;
  declare name: any;

  constructor(container: any = defaultContainer) {
    this.container = container.container || container;
    this.name = 'normalize';
  }

  normalize(text, _input?) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    const normalizer = this.container.get(`normalizer-${locale}`) || this;
    input.text = normalizer.normalize(input.text, input);
    return input;
  }
}

export default Normalizer;
