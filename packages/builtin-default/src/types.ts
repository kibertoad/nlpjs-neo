import type { Locale, PipelineInput, Settings } from '@nlpjs-neo/core';

/**
 * Types of the default builtin extractor. It does not depend on `ner`, so the
 * edges it produces are described here; `ner` consumes them structurally.
 */

/** What a recognized entity resolves to. */
export interface BuiltinResolution {
  value: string | number | Date;
  /** Kind of the value, such as `ipv4` or `integer`. */
  type?: string;
}

/** One entity found in an utterance, in the shape `ner` reduces. */
export interface BuiltinEdge {
  start: number;
  end: number;
  len: number;
  accuracy: number;
  sourceText: string;
  utteranceText: string;
  entity?: string;
  resolution: BuiltinResolution;
  /** Set while reducing, on an edge another one wins over. */
  discarded?: boolean;
}

/** Recognizes one kind of entity in a text. */
export type Recognizer = (text: string, locale?: Locale) => BuiltinEdge[];

/** Settings of a `BuiltinDefault`. */
export interface BuiltinDefaultSettings extends Settings {
  /** Which recognizers run; every name has a `recognize<Name>`. */
  builtins?: string[];
}

/** Object flowing through the extraction pipeline. */
export interface BuiltinInput extends PipelineInput {
  edges?: BuiltinEdge[];
  /** Restricts which recognizers run for this utterance. */
  builtins?: string[];
}
