import type { PipelineInput, Settings } from '@nlpjs-neo/core';

/**
 * Types of the Duckling extractor: what the service answers, and what this
 * turns it into. This package does not depend on `ner`, so the edges it
 * produces are described here; `ner` consumes them structurally.
 */

/** Value of one Duckling entity. Its shape depends on the dimension. */
export interface DucklingValue {
  value?: string | number;
  unit?: string;
  product?: string;
  domain?: string;
  grain?: string;
  values?: unknown[];
  /** For a duration, the value converted to a single unit. */
  normalized?: { value: number; unit: string };
  [key: string]: unknown;
}

/** One entity as the Duckling service reports it. */
export interface DucklingEntity {
  /** Dimension, such as `time`, `amount-of-money` or `phone-number`. */
  dim: string;
  /** The text this was recognized from. */
  body: string;
  start: number;
  end: number;
  value: DucklingValue;
  [key: string]: unknown;
}

/** What a Duckling entity resolves to, once translated. */
export interface DucklingResolution {
  value?: string | number;
  strValue?: string;
  unit?: string;
  subtype?: string;
  product?: string;
  domain?: string;
  grain?: string;
  values?: unknown[];
}

/** One entity in the shape `ner` reduces. */
export interface DucklingEdge {
  start: number;
  end: number;
  len: number;
  accuracy: number;
  sourceText: string;
  utteranceText: string;
  /** Dimension the service reported, before it was translated. */
  rawEntity: string;
  entity?: string;
  resolution?: DucklingResolution;
}

/** Settings of a `BuiltinDuckling`. */
export interface BuiltinDucklingSettings extends Settings {
  /** Where the Duckling service answers; defaults to `DUCKLING_URL`. */
  ducklingUrl?: string;
  /** Set by `node-nlp` to choose Duckling over the Microsoft recognizers. */
  useDuckling?: boolean;
}

/** Object flowing through the extraction pipeline. */
export interface DucklingInput extends PipelineInput {
  edges?: DucklingEdge[];
  /** Entities as the service reported them, kept alongside the edges. */
  sourceEntities?: DucklingEntity[];
}
