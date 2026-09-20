import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import {
  ArrToObj,
  Container,
  Normalizer,
  ObjToArr,
  Stemmer,
  Stopwords,
  Tokenizer,
  Timer,
  logger,
  MemoryStorage,
} from '@nlpjs-neo/core';
import type {
  ChildPipeline,
  ContainerPlugin,
  ServiceConstructor,
  ServiceInstance,
} from '@nlpjs-neo/core';
import type {
  LoaderConfiguration,
  LoaderSettings,
  PluginEntry,
  PluginInformation,
} from './types.js';
import { fs as requestfs, request } from '@nlpjs-neo/request';
import pluginInformation from './plugin-information.json' with { type: 'json' };
import {
  listFilesAbsolute,
  getAbsolutePath,
  loadEnv,
  loadEnvFromJson,
} from './helper.js';

// Plugins and optional libraries are resolved by name at runtime, from a
// synchronous entry point, so they are loaded through `createRequire` rather
// than `import()`. Node resolves ESM through it as well (>= 22.12), returning a
// module namespace, hence the `default` unwrapping below.
const require = createRequire(import.meta.url);

const defaultPathConfiguration = './conf.json';
const defaultPathPipeline = './pipelines.md';
const defaultPathPlugins = './plugins';

function loadPipelinesStr(instance: Container, pipelines: string): void {
  instance.loadPipelinesFromString(pipelines);
}

function loadPipelinesFromFile(instance: Container, fileName: string): void {
  const str = fs.readFileSync(fileName, 'utf8');
  instance.loadPipelinesFromString(str);
}

/** Loads every `.md` pipeline file under a path, a list of paths or a folder. */
function loadPipelines(instance: Container, fileName: string | string[]): void {
  if (Array.isArray(fileName)) {
    for (let i = 0; i < fileName.length; i += 1) {
      loadPipelines(instance, fileName[i]);
    }
  } else if (fs.existsSync(fileName)) {
    if (fs.lstatSync(fileName).isDirectory()) {
      const files = listFilesAbsolute(fileName).filter((x) =>
        x.endsWith('.md')
      );
      for (let i = 0; i < files.length; i += 1) {
        loadPipelines(instance, files[i]);
      }
    } else {
      loadPipelinesFromFile(instance, fileName);
    }
  }
}

/** Loads every `.js` plugin under a path, a list of paths or a folder. */
function loadPlugins(instance: Container, fileName: string | string[]): void {
  if (Array.isArray(fileName)) {
    for (let i = 0; i < fileName.length; i += 1) {
      loadPlugins(instance, fileName[i]);
    }
  } else if (fs.existsSync(fileName)) {
    if (fs.lstatSync(fileName).isDirectory()) {
      const files = listFilesAbsolute(fileName).filter((x) =>
        x.endsWith('.js')
      );
      for (let i = 0; i < files.length; i += 1) {
        loadPlugins(instance, files[i]);
      }
    } else {
      const plugin = require(fileName) as {
        default?: ContainerPlugin | ServiceConstructor;
      } & ContainerPlugin;
      instance.use(plugin.default ?? plugin);
    }
  }
}

/**
 * Resolves the `$ENV_VAR` references a configuration may hold, in place of any
 * string value and at any depth. A reference is looked up prefixed first, so a
 * child container can override what its parent reads.
 */
function traverse<T>(obj: T, preffix: string): T {
  if (typeof obj === 'string') {
    if (obj.startsWith('$')) {
      return (process.env[`${preffix}${obj.slice(1)}`] ||
        process.env[obj.slice(1)]) as T;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => traverse(x, preffix)) as T;
  }
  if (typeof obj === 'object' && obj !== null) {
    const source = obj as Record<string, unknown>;
    const keys = Object.keys(source);
    const result: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = traverse(source[keys[i]], preffix);
    }
    return result as T;
  }
  return obj;
}

const pluginRegistry = pluginInformation as PluginInformation;

function containerBootstrap(
  inputSettings?: LoaderSettings | string,
  srcMustLoadEnv?: boolean,
  container?: Container,
  preffix?: string,
  pipelines?: ChildPipeline[],
  parent?: Container
): Container {
  const mustLoadEnv = srcMustLoadEnv === undefined ? true : srcMustLoadEnv;
  const instance = container || new Container(Boolean(preffix));
  instance.parent = parent;
  if (!preffix) {
    instance.register('fs', requestfs);
    instance.register('request', { get: request });
    instance.use(ArrToObj);
    instance.use(Normalizer);
    instance.use(ObjToArr);
    instance.use(Stemmer);
    instance.use(Stopwords);
    instance.use(Tokenizer);
    instance.use(Timer);
    instance.use(logger);
    instance.use(MemoryStorage);
  }
  const srcSettings: LoaderSettings =
    typeof inputSettings === 'string' ? {} : inputSettings || {};
  let settings: LoaderSettings;
  if (typeof inputSettings === 'string') {
    settings = {
      pathConfiguration: inputSettings,
      pathPipeline: defaultPathPipeline,
      pathPlugins: defaultPathPlugins,
    };
  } else {
    settings = srcSettings;
    if (!settings.pathConfiguration) {
      settings.pathConfiguration = defaultPathConfiguration;
    }
    if (!settings.pathPipeline) {
      settings.pathPipeline = defaultPathPipeline;
    }
    if (!settings.pathPlugins) {
      settings.pathPlugins = defaultPathPlugins;
    }
  }
  if (
    srcSettings.loadEnv ||
    (srcSettings.loadEnv === undefined && mustLoadEnv)
  ) {
    loadEnv();
  }
  settings.pathConfiguration = getAbsolutePath(settings.pathConfiguration);
  if (srcSettings.envFileName) {
    loadEnv(srcSettings.envFileName);
  }
  if (srcSettings.env) {
    loadEnvFromJson(preffix, srcSettings.env);
  }
  let srcConfiguration: LoaderConfiguration;
  if (settings.isChild || !fs.existsSync(settings.pathConfiguration)) {
    srcConfiguration = settings;
  } else {
    srcConfiguration = JSON.parse(
      fs.readFileSync(settings.pathConfiguration, 'utf8')
    ) as LoaderConfiguration;
  }
  const configuration = traverse(
    srcConfiguration,
    preffix ? `${preffix}_` : ''
  );
  if (configuration.pathPipeline) {
    settings.pathPipeline = configuration.pathPipeline;
  }
  if (configuration.pathPlugins) {
    settings.pathPlugins = configuration.pathPlugins;
  }
  if (configuration.settings) {
    const keys = Object.keys(configuration.settings);
    for (let i = 0; i < keys.length; i += 1) {
      instance.registerConfiguration(
        keys[i],
        configuration.settings[keys[i]],
        true
      );
    }
  }
  if (configuration.use) {
    for (let i = 0; i < configuration.use.length; i += 1) {
      const current = configuration.use[i];
      if (typeof current === 'string') {
        const entry = pluginRegistry[current];
        if (!entry) {
          throw new Error(
            `Plugin information not found for plugin "${current}"`
          );
        }
        const infoArr: PluginEntry[] = Array.isArray(entry) ? entry : [entry];
        for (let j = 0; j < infoArr.length; j += 1) {
          const info = infoArr[j];
          let lib: Record<string, ContainerPlugin | ServiceConstructor>;
          try {
            lib = require(info.path);
          } catch {
            try {
              lib = require(
                getAbsolutePath(path.join('./node_modules', info.path))
              );
            } catch (err2) {
              throw new Error(
                `You have to install library "${info.path}" to use plugin "${current}"`,
                { cause: err2 }
              );
            }
          }
          instance.use(lib[info.className], info.name, info.isSingleton);
        }
      } else {
        let lib: Record<string, ContainerPlugin | ServiceConstructor>;
        try {
          lib = require(current.path);
        } catch {
          lib = require(getAbsolutePath(current.path));
        }
        instance.use(lib[current.className], current.name, current.isSingleton);
      }
    }
  }
  if (configuration.terraform) {
    for (let i = 0; i < configuration.terraform.length; i += 1) {
      const current = configuration.terraform[i];
      const terra = instance.get<ServiceInstance>(current.className);
      instance.register(current.name, terra, true);
    }
  }
  if (configuration.childs) {
    instance.childs = configuration.childs;
  }
  if (pipelines) {
    for (let i = 0; i < pipelines.length; i += 1) {
      const pipeline = pipelines[i];
      instance.registerPipeline(
        pipeline.tag,
        pipeline.pipeline,
        pipeline.overwrite
      );
    }
  }
  loadPipelines(instance, settings.pathPipeline || './pipelines.md');
  if (configuration.pipelines) {
    loadPipelinesStr(instance, configuration.pipelines);
  }
  loadPlugins(instance, settings.pathPlugins || './plugins');
  return instance;
}

export default containerBootstrap;
