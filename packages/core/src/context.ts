import { defaultContainer, type Container } from './container.js';
import Clonable from './clonable.js';
import type { Settings, Storage, StorageItem } from './types.js';

class Context extends Clonable {
  declare container: Container;
  declare settings: Settings;

  constructor(settings: Settings = {}, container?: Container) {
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

  getStorage(): Storage {
    const storage = this.container.get<Storage>(
      this.settings.storageName || 'storage'
    );
    if (!storage) {
      throw new Error('Storage not found');
    }
    return storage;
  }

  getContext(key: string): Promise<Record<string, StorageItem>> {
    const storage = this.getStorage();
    return storage.read(`${this.settings.tag}-${key}`);
  }

  setContext(key: string, value: StorageItem): Promise<StorageItem> {
    const storage = this.getStorage();
    const change = {
      [`${this.settings.tag}-${key}`]: value,
    };
    return storage.write(change);
  }

  async getContextValue(key: string, valueName: string): Promise<unknown> {
    const context = await this.getContext(key);
    const item = context[`${this.settings.tag}-${key}`];
    return item ? item[valueName] : undefined;
  }

  async setContextValue(
    key: string,
    valueName: string,
    value: unknown
  ): Promise<StorageItem> {
    // The stored context doubles as the read result, so it is written
    // back as a single item.
    let context: StorageItem = await this.getContext(key);
    if (!context) {
      context = {};
    }
    context[valueName] = value;
    return this.setContext(key, context);
  }
}

export default Context;
