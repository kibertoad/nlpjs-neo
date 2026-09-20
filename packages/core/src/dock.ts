import containerBootstrap from './container-bootstrap.js';
import type { Container } from './container.js';
import type {
  ChildPipeline,
  ChildSettings,
  ContainerConfiguration,
} from './types.js';

/**
 * Settings a container is created from: a configuration object, or the path
 * of the JSON file holding one.
 */
type DockSettings = ContainerConfiguration | string;

class Dock {
  declare containers: Record<string, Container>;

  constructor() {
    this.containers = {};
  }

  getContainer(name?: string): Container | undefined {
    return this.containers[name || 'default'];
  }

  async createContainer(
    name: string | DockSettings,
    settings?: DockSettings,
    srcMustLoadEnv?: boolean,
    preffix?: string,
    parent?: Container,
    pipelines?: ChildPipeline[]
  ): Promise<Container> {
    const mustLoadEnv = srcMustLoadEnv === undefined ? true : srcMustLoadEnv;
    // The name is optional: called with settings in its place, the container
    // is the unnamed one.
    let containerName: string;
    if (typeof name !== 'string') {
      settings = name;
      containerName = '';
    } else {
      containerName = name;
    }
    if (!settings) {
      if (containerName === 'default' || containerName === '') {
        settings = 'conf.json';
      }
    }
    if (!this.containers[containerName]) {
      const container = containerBootstrap(
        settings,
        mustLoadEnv,
        undefined,
        preffix,
        pipelines
      );
      container.name = containerName;
      this.containers[containerName] = container;
      container.dock = this;
      container.parent = parent;
      await container.start();
      if (container.childs) {
        await this.buildChilds(container);
      }
    }
    return this.containers[containerName];
  }

  /**
   * Replaces the settings the bootstrap left under `childs` with the
   * containers built from them.
   */
  async buildChilds(container: Container): Promise<void> {
    if (container && container.childs) {
      const keys = Object.keys(container.childs);
      const childs: Record<string, Container> = {};
      for (let i = 0; i < keys.length; i += 1) {
        const settings = container.childs[keys[i]] as ChildSettings;
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

  async terraform(
    settings?: DockSettings,
    mustLoadEnv = true
  ): Promise<Container> {
    const defaultContainer = await this.createContainer(
      'default',
      settings,
      mustLoadEnv,
      ''
    );
    return defaultContainer;
  }

  start(settings?: DockSettings, mustLoadEnv = true): Promise<Container> {
    return this.terraform(settings, mustLoadEnv);
  }
}

const dock = new Dock();

export default dock;
export { Dock };
