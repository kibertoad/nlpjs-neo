/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
      [`${this.settings.tag}-${key}`]: value,
    };
    return storage.write(change);
  }

  async getContextValue(key, valueName) {
    const context = await this.getContext(key);
    const item = context[`${this.settings.tag}-${key}`];
    return item ? item[valueName] : undefined;
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
