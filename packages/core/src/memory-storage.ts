import { defaultContainer, type Container } from './container.js';
import Clonable from './clonable.js';
import type { Settings, Storage, StorageItem } from './types.js';

interface MemoryStorageSettings extends Settings {
  /** Revision counter handed out as the `eTag` of the next written item. */
  etag: number;
  /** Items by key, serialized so that reads and writes are by value. */
  memory: Record<string, string>;
}

class MemoryStorage extends Clonable implements Storage {
  declare container: Container;
  declare settings: MemoryStorageSettings;

  constructor(settings: Settings = {}, container?: Container) {
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

  read(keys: string | string[]): Promise<Record<string, StorageItem>> {
    return new Promise((resolve) => {
      const data: Record<string, StorageItem> = {};
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach((key) => {
        const item = this.settings.memory[key];
        if (item) {
          data[key] = JSON.parse(item);
        }
      });
      resolve(data);
    });
  }

  saveItem(key: string, item: StorageItem): StorageItem {
    const clone = { ...item };
    clone.eTag = this.settings.etag.toString();
    this.settings.etag += 1;
    this.settings.memory[key] = JSON.stringify(clone);
    return clone;
  }

  async write(changes: Record<string, StorageItem>): Promise<StorageItem> {
    const keys = Object.keys(changes);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const newItem = changes[key];
      const oldStr = this.settings.memory[key];
      if (oldStr && newItem.eTag !== '*') {
        const oldItem = JSON.parse(oldStr);
        if (newItem.eTag !== oldItem.eTag) {
          throw new Error(`Error writing "${key}" due to eTag conflict.`);
        }
      }
    }
    let result: StorageItem = {};
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      result = this.saveItem(key, changes[key]);
    }
    return result;
  }

  delete(keys: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      keys.forEach((key) => delete this.settings.memory[key]);
      resolve();
    });
  }
}

export default MemoryStorage;
