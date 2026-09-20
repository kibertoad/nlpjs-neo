import { defaultContainer } from './container.js';
import Clonable from './clonable.js';

class MemoryStorage extends Clonable {
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
    this.applySettings(this.settings, { etag: 1, memory: {} });
    if (!this.settings.tag) {
      this.settings.tag = 'storage';
    }
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
  }

  read(keys) {
    return new Promise((resolve) => {
      const data: any = {};
      if (!Array.isArray(keys)) {
        keys = [keys];
      }
      keys.forEach((key) => {
        const item = this.settings.memory[key];
        if (item) {
          data[key] = JSON.parse(item);
        }
      });
      resolve(data);
    });
  }

  saveItem(key, item) {
    const clone = { ...item };
    clone.eTag = this.settings.etag.toString();
    this.settings.etag += 1;
    this.settings.memory[key] = JSON.stringify(clone);
    return clone;
  }

  write(changes) {
    return new Promise((resolve, reject) => {
      Object.keys(changes).forEach((key) => {
        const newItem = changes[key];
        const oldStr = this.settings.memory[key];
        if (!oldStr || newItem.eTag === '*') {
          return resolve(this.saveItem(key, newItem));
        }
        const oldItem = JSON.parse(oldStr);
        if (newItem.eTag !== oldItem.eTag) {
          return reject(
            new Error(`Error writing "${key}" due to eTag conflict.`)
          );
        }
        return resolve(this.saveItem(key, newItem));
      });
    });
  }

  delete(keys) {
    return new Promise<void>((resolve) => {
      keys.forEach((key) => delete this.settings.memory[key]);
      resolve();
    });
  }
}

export default MemoryStorage;
