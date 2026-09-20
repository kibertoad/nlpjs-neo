import { Clonable, containerBootstrap } from '@nlpjs-neo/core';
import Session from './session.js';

class Connector extends Clonable {
  declare settings: any;

  constructor(settings: any = {}, container = undefined) {
    super(
      {
        settings: {},
        container: settings.container || container || containerBootstrap(),
      },
      container
    );
    this.applySettings(this.settings, settings);
    this.registerDefault();
    if (!this.settings.tag) {
      this.settings.tag = this.getSnakeName();
    }
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.initialize();
  }

  registerDefault() {
    // Empty
  }

  getSnakeName() {
    const name = this.constructor.name
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('-');
    return name.endsWith('-connector') ? name.slice(0, -10) : name;
  }

  initialize() {
    // Should be implemented by childs
  }

  close() {
    // Should be implemented by childs
  }

  destroy() {
    this.close();
  }

  createSession(activity: any = {}) {
    return new Session(this, activity);
  }
}

export default Connector;
