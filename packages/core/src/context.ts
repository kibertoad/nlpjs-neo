import { defaultContainer } from './container.js';
import Clonable from './clonable.js';

class Context extends Clonable {
  declare container: any;
  declare settings: any;

  constructor(settings: any = {}, container = undefined) {
    super(
      {
        settings: {},
        container: settings.container || container || defaultContainer,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = 'context';
    }
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
  }

  getStorage() {
    const storage = this.container.get(this.settings.storageName || 'storage');
    if (!storage) {
      throw new Error('Storage not found');
    }
    return storage;
  }

  getContext(key) {
    const storage = this.getStorage();
    return storage.read(`${this.settings.tag}-${key}`);
  }

  setContext(key, value) {
    const storage = this.getStorage();
    const change = {
      [key]: value,
    };
    return storage.write(change);
  }

  async getContextValue(key, valueName) {
    const context = await this.getContext(key);
    return context ? context[valueName] : undefined;
  }

  async setContextValue(key, valueName, value) {
    let context = await this.getContext(key);
    if (!context) {
      context = {};
    }
    context[valueName] = value;
    return this.setContext(key, context);
  }
}

export default Context;
