import type { PipelineInput, Settings } from '@nlpjs-neo/core';

/**
 * Types of the Microsoft recognizers extractor: what the recognizers answer,
 * and what this turns it into. This package does not depend on `ner`, so the
 * edges it produces are described here; `ner` consumes them structurally.
 */

/** One resolved date or range of a `datetimeV2` entity. */
export interface DateTimeResolutionValue {
  type?: string;
  timex?: string;
  value?: string;
  start?: string;
  end?: string;
}

/** What a recognizer resolved an entity to, before it is translated. */
export interface RecognizerResolution {
  value?: string;
  unit?: string;
  /** Unit as the recognizer reported it, before translation. */
  srcUnit?: string;
  values?: DateTimeResolutionValue[];
  [key: string]: unknown;
}

/** One entity as a Microsoft recognizer reports it. */
export interface RecognizerEntity {
  start: number;
  end: number;
  text: string;
  /** Kind of the entity, such as `datetimeV2.date` or `number`. */
  typeName: string;
  resolution?: RecognizerResolution;
  /** The short form of `typeName`, filled in while extracting. */
  entity?: string;
}

/** What one entity resolves to, once translated and converted. */
export interface BuiltinResolution {
  value?: string | number;
  strValue?: string;
  type?: string;
  timex?: string;
  subtype?: string;
  unit?: string;
  /** Unit in the language of the utterance. */
  localeUnit?: string;
  date?: Date;
  start?: Date;
  end?: Date;
  strPastValue?: string;
  pastDate?: Date;
  strPastStartValue?: string;
  pastStartDate?: Date;
  strPastEndValue?: string;
  pastEndDate?: Date;
  strFutureValue?: string;
  futureDate?: Date;
  strFutureStartValue?: string;
  futureStartDate?: Date;
  strFutureEndValue?: string;
  futureEndDate?: Date;
  [key: string]: unknown;
}

/** One entity in the shape `ner` reduces. */
export interface BuiltinEdge {
  start: number;
  end: number;
  len: number;
  accuracy: number;
  sourceText: string;
  utteranceText: string;
  entity?: string;
  /** Kind the recognizer reported, before it was shortened. */
  rawEntity: string;
  resolution?: BuiltinResolution;
  /** Set while reducing, on an edge another one wins over. */
  discarded?: boolean;
}

/** Settings of a `BuiltinMicrosoft`. */
export interface BuiltinMicrosoftSettings extends Settings {
  /** Which recognizers run; every name has a `recognize<Name>`. */
  builtins?: string[];
  /** Entities that are reported; anything else is recognized and dropped. */
  allowList?: string[];
  /** `allowList` as a lookup set, built in the constructor. */
  builtinAllowList?: Record<string, 1>;
}

/** Object flowing through the extraction pipeline. */
export interface BuiltinInput extends PipelineInput {
  edges?: BuiltinEdge[];
  /** Entities as the recognizers reported them, kept alongside the edges. */
  sourceEntities?: RecognizerEntity[];
  /** Restricts which recognizers run for this utterance. */
  builtins?: string[];
}
