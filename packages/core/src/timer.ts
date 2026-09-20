import { defaultContainer } from './container.js';

/**
 * Class for a simple timer
 */
class Timer {
  declare container: any;
  declare name: any;

  /**
   * Constructor of the class
   * @param {object} container Parent container
   */
  constructor(container = defaultContainer) {
    this.container = container.container || container;
    this.name = 'timer';
  }

  /**
   * Starts the timer
   * @param {object} input
   */
  start(input) {
    if (input) {
      input.hrstart = new Date();
    }
    return input;
  }

  /**
   * Stops the timer
   * @param {object} srcInput
   */
  stop(srcInput) {
    const input = srcInput;
    if (input && input.hrstart) {
      const hrend = new Date();
      input.elapsed = hrend.getTime() - input.hrstart.getTime();
      delete input.hrstart;
    }
    return input;
  }

  run(srcInput) {
    this.start(srcInput);
  }
}

export default Timer;
