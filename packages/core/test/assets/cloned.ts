import { Clonable } from '../../src/index.js';
import type {
  JsonExportRules,
  JsonImportRules,
  SerializedInstance,
  Settings,
} from '../../src/index.js';

/** A `Clonable` with export rules of every kind, for the round trip tests. */
class Cloned extends Clonable {
  declare age: number;
  /** Names of the properties `values` is flattened against. */
  declare keys: string[];
  declare name: string;
  declare surname: string;
  declare values: Record<string, unknown> | unknown[];

  declare jsonExport: JsonExportRules;
  declare jsonImport: JsonImportRules;
  declare nick: string;

  constructor(settings?: Settings) {
    super(settings);
    this.nick = 'nick';
    this.jsonExport = {
      keys: false,
      values: this.exportValues,
      surname: 'familyname',
      nick: {},
    };
    this.jsonImport = {
      keys: false,
      values: this.importValues,
      familyname: 'surname',
      nick: {},
    };
  }

  exportValues(
    target: SerializedInstance,
    source: Cloned,
    key: string,
    value: Record<string, unknown>
  ): unknown[] {
    return this.objToValues(value, this.keys);
  }

  importValues(
    target: Cloned,
    source: SerializedInstance,
    key: string,
    value: unknown[]
  ): Record<string, unknown> {
    return this.valuesToObj(value, this.keys);
  }

  writeValues(
    target: SerializedInstance,
    source: Cloned,
    key: string,
    value: Record<string, unknown>
  ): void {
    const tgt = target;
    tgt.values = this.objToValues(value, this.keys);
  }

  readValues(
    target: Cloned,
    source: SerializedInstance,
    key: string,
    value: unknown[]
  ): void {
    const tgt = target;
    tgt.values = this.valuesToObj(value, this.keys);
  }
}

export default Cloned;
