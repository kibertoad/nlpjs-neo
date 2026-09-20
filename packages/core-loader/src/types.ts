import type {
  ChildSettings,
  ContainerConfiguration,
  Settings,
  TerraformEntry,
} from '@nlpjs-neo/core';

/**
 * One plugin of `plugin-information.json`: the package to require and the
 * export of it to register.
 */
export interface PluginEntry {
  className: string;
  path: string;
  /** Name to register the plugin under; defaults to the plugin's own name. */
  name?: string;
  isSingleton?: boolean;
}

/**
 * Plugins this loader knows by name, from `plugin-information.json`. A name
 * may stand for several plugins, as `Basic` does.
 */
export type PluginInformation = Record<string, PluginEntry | PluginEntry[]>;

/**
 * Where a container loads itself from. These are the settings of the loader
 * rather than of the app: the app's own settings are read from the
 * configuration file they point at.
 */
export interface LoaderSettings extends Settings {
  /** Configuration file to read; defaults to `./conf.json`. */
  pathConfiguration?: string;
  /** Pipeline file or folder to load; defaults to `./pipelines.md`. */
  pathPipeline?: string | string[];
  /** Plugin file or folder to load; defaults to `./plugins`. */
  pathPlugins?: string | string[];
  /** When `false`, `.env` is not read. Defaults to the caller's flag. */
  loadEnv?: boolean;
  /** Environment file to read on top of `.env`. */
  envFileName?: string;
  env?: Record<string, string>;
  /** Set by the dock on a child container, whose settings are its configuration. */
  isChild?: boolean;
  childs?: Record<string, ChildSettings>;
  terraform?: TerraformEntry[];
}

/**
 * Configuration this loader reads. It extends the one the core container
 * understands with the paths it resolves and with plugins named rather than
 * passed: a string is looked up in `plugin-information.json`, an object names
 * the package to require directly.
 */
export interface LoaderConfiguration
  extends Omit<ContainerConfiguration, 'use'>, LoaderSettings {
  use?: (string | PluginEntry)[];
  /** Pipelines in the pipeline file format, as a single string. */
  pipelines?: string;
}
