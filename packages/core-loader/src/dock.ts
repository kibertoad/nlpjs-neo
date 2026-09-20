import fs from 'fs';
import path from 'path';
import containerBootstrap from './container-bootstrap.js';

class Dock {
  declare containers: any;

  constructor() {
    this.containers = {};
  }

  getContainer(name?) {
    return this.containers[name || 'default'];
  }

  get(name) {
    const container = this.getContainer();
    if (container) {
      return container.get(name);
    }
    return undefined;
  }

  async createContainer(
    name,
    settings,
    srcMustLoadEnv,
    preffix,
    parent?,
    pipelines?
  ) {
    const mustLoadEnv = srcMustLoadEnv === undefined ? true : srcMustLoadEnv;
    if (typeof name !== 'string') {
      settings = name;
      name = '';
    }
    if (!settings) {
      if (name === 'default' || name === '') {
        settings = 'conf.json';
      } else {
        settings = path.join(name, 'conf.json');
        if (!fs.existsSync(settings)) {
          settings = `${name}_conf.json`;
        }
      }
    }
    if (!this.containers[name]) {
      const container = containerBootstrap(
        settings,
        mustLoadEnv,
        undefined,
        preffix,
        pipelines,
        parent
      );
      container.name = name;
      this.containers[name] = container;
      container.dock = this;
      await container.start();
      if (container.childs) {
        await this.buildChilds(container);
      }
    }
    return this.containers[name];
  }

  async buildChilds(container) {
    if (container && container.childs) {
      const keys = Object.keys(container.childs);
      const childs: any = {};
      for (let i = 0; i < keys.length; i += 1) {
        const settings = container.childs[keys[i]];
        settings.isChild = true;
        if (!settings.pathPipeline) {
          settings.pathPipeline = `${keys[i]}_pipeline.md`;
        }
        childs[keys[i]] = await this.createContainer(
          keys[i],
          settings,
          false,
          keys[i],
          container,
          container.childPipelines
            ? container.childPipelines[keys[i]]
            : undefined
        );
      }
      container.childs = childs;
    }
  }

  async terraform(settings, mustLoadEnv = true) {
    const defaultContainer = await this.createContainer(
      'default',
      settings,
      mustLoadEnv,
      ''
    );
    return defaultContainer;
  }

  start(settings, mustLoadEnv = true) {
    return this.terraform(settings, mustLoadEnv);
  }
}

const dock = new Dock();

export default dock;
