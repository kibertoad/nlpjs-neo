import { defaultContainer, type Container } from './container.js';
import type { ContainerHolder, PipelineInput } from './types.js';

/**
 * Class for a simple timer
 */
class Timer {
  declare container: Container;
  declare name: string;

  /**
   * Constructor of the class
   * @param container Parent container
   */
  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'timer';
  }

  /**
   * Starts the timer, writing the start mark into the input.
   */
  start<T extends PipelineInput | undefined>(input: T): T {
    if (input) {
      input.hrstart = new Date();
    }
    return input;
  }

  /**
   * Stops the timer, replacing the start mark by the elapsed milliseconds.
   */
  stop<T extends PipelineInput | undefined>(srcInput: T): T {
    const input = srcInput;
    if (input && input.hrstart) {
      const hrend = new Date();
      input.elapsed = hrend.getTime() - input.hrstart.getTime();
      delete input.hrstart;
    }
    return input;
  }

  run<T extends PipelineInput>(input: T): T {
    return this.start(input);
  }
}

export default Timer;
